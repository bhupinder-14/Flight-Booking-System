const amqplib = require("amqplib");
const { ServerConfig, Logger, SMTP_CONFIGURED } = require("../config");
const EmailService = require("./email-service");

const QUEUE_NAME = "noti-queue";
const RETRY_QUEUE_NAME = "noti-queue.retry";
const DEAD_LETTER_QUEUE_NAME = "noti-queue.dead";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;
const RECONNECT_DELAY_MS = 5000;
const RETRY_HEADER = "x-notification-attempts";
const TRANSIENT_ERROR_CODES = new Set([
  "ECONNECTION",
  "ECONNREFUSED",
  "ECONNRESET",
  "EAI_AGAIN",
  "EPIPE",
  "ESOCKET",
  "ETIMEDOUT",
]);

function errorSummary(error) {
  const code = typeof error?.code === "string" ? error.code : "UNKNOWN";
  const responseCode = Number.isInteger(error?.responseCode)
    ? error.responseCode
    : undefined;
  return { code, responseCode };
}

function isTransientSmtpError(error) {
  return (
    TRANSIENT_ERROR_CODES.has(error?.code) ||
    (Number.isInteger(error?.responseCode) &&
      error.responseCode >= 400 &&
      error.responseCode < 500)
  );
}

function notificationDetails(notification) {
  const booking = notification.bookingDetails;
  const flight = notification.flightData;
  return {
    bookingId: booking.bookingId,
    userId: booking.userId,
    seats: booking.noofSeats,
    totalCost: booking.totalCost,
    flightId: flight.flightId,
    flightNumber: flight.flightNumber,
    departure: flight.departure,
    arrival: flight.arrival,
    departureTime: flight.departureTime,
    arrivalTime: flight.arrivalTime,
  };
}

function validateNotification(notification) {
  if (
    !notification ||
    typeof notification !== "object" ||
    Array.isArray(notification) ||
    typeof notification.subject !== "string" ||
    !notification.bookingDetails ||
    typeof notification.bookingDetails !== "object" ||
    !notification.flightData ||
    typeof notification.flightData !== "object"
  ) {
    throw new Error("Notification payload is missing required fields");
  }
}

function createNotificationConsumer({
  client = amqplib,
  emailService = EmailService,
  smtpConfigured = SMTP_CONFIGURED,
  gmailEmail = ServerConfig.GMAIL_EMAIL,
  logger = Logger,
  reconnectDelayMs = RECONNECT_DELAY_MS,
} = {}) {
  let connection;
  let channel;
  let consumerTag;
  let connecting = false;
  let reconnectTimer;
  let stopped = false;

  function scheduleReconnect() {
    if (stopped || reconnectTimer) return;

    logger.warn(
      `RabbitMQ consumer reconnect scheduled in ${reconnectDelayMs}ms`
    );
    reconnectTimer = setTimeout(() => {
      reconnectTimer = undefined;
      void connectQueue();
    }, reconnectDelayMs);
    reconnectTimer.unref?.();
  }

  function closeAfterFailure(activeConnection, reason) {
    if (connection !== activeConnection) return;

    const activeChannel = channel;
    logger.error(`RabbitMQ connection failed (${errorSummary(reason).code})`);
    connection = undefined;
    channel = undefined;
    consumerTag = undefined;
    scheduleReconnect();

    if (activeChannel) void activeChannel.close().catch(() => {});
    void activeConnection.close().catch(() => {});
  }

  function handleDelivery(activeConnection, activeChannel, message) {
    if (message === null) {
      logger.warn("RabbitMQ cancelled the notification consumer");
      closeAfterFailure(activeConnection, new Error("Consumer cancelled"));
      return;
    }

    void processDelivery(activeChannel, message).catch((error) => {
      logger.error(
        `Notification processing stopped before acknowledgement (${errorSummary(error).code}); the delivery will be requeued when the connection closes`
      );
      closeAfterFailure(activeConnection, error);
    });
  }

  async function publishThenAcknowledge(
    activeChannel,
    message,
    targetQueue,
    headers
  ) {
    const properties = message.properties || {};
    const forwardedProperties = {
      persistent: true,
      contentType: properties.contentType || "application/json",
      headers: { ...(properties.headers || {}), ...headers },
    };
    for (const key of ["contentEncoding", "correlationId", "messageId", "type"]) {
      if (properties[key] !== undefined) forwardedProperties[key] = properties[key];
    }
    activeChannel.sendToQueue(targetQueue, message.content, forwardedProperties);
    await activeChannel.waitForConfirms();
    activeChannel.ack(message);
  }

  async function moveToDeadLetter(activeChannel, message, reason) {
    await publishThenAcknowledge(
      activeChannel,
      message,
      DEAD_LETTER_QUEUE_NAME,
      { "x-notification-error": reason }
    );
  }

  async function processDelivery(activeChannel, message) {
    let notification;
    try {
      notification = JSON.parse(message.content.toString("utf8"));
      validateNotification(notification);
    } catch (error) {
      const reason = error instanceof SyntaxError ? "invalid-json" : "invalid-payload";
      logger.error(`Malformed notification routed to ${DEAD_LETTER_QUEUE_NAME} (${reason})`);
      await moveToDeadLetter(activeChannel, message, reason);
      return;
    }

    const details = notificationDetails(notification);
    if (!smtpConfigured) {
      logger.warn(
        `NOTIFICATION LOGGED LOCALLY; EMAIL SKIPPED because SMTP credentials are not configured. No email was sent. ${JSON.stringify(details)}`
      );
      activeChannel.ack(message);
      return;
    }

    try {
      await emailService.sendEmail(gmailEmail, notification);
      logger.info(`SMTP email delivered. ${JSON.stringify(details)}`);
      activeChannel.ack(message);
    } catch (error) {
      const attempts = Number(message.properties?.headers?.[RETRY_HEADER]) || 0;
      const errorInfo = errorSummary(error);

      if (isTransientSmtpError(error) && attempts < MAX_RETRIES) {
        await publishThenAcknowledge(
          activeChannel,
          message,
          RETRY_QUEUE_NAME,
          {
            [RETRY_HEADER]: attempts + 1,
            "x-notification-error-code": errorInfo.code,
          }
        );
        logger.warn(
          `Transient SMTP failure (${errorInfo.code}); retry ${attempts + 1}/${MAX_RETRIES} scheduled after ${RETRY_DELAY_MS}ms. ${JSON.stringify(details)}`
        );
        return;
      }

      await moveToDeadLetter(
        activeChannel,
        message,
        `smtp-${errorInfo.code.toLowerCase()}`
      );
      logger.error(
        `SMTP delivery failed (${errorInfo.code}); message retained in ${DEAD_LETTER_QUEUE_NAME} and was not reported as sent. ${JSON.stringify(details)}`
      );
    }
  }

  async function connectQueue() {
    if (stopped || connecting || (connection && channel)) return;
    connecting = true;
    let activeConnection;
    let activeChannel;

    try {
      activeConnection = await client.connect(
        "amqp://localhost?frameMax=8192"
      );
      if (stopped) {
        await activeConnection.close();
        return;
      }
      connection = activeConnection;

      activeConnection.on("error", (error) => {
        logger.error(
          `RabbitMQ connection error (${errorSummary(error).code})`
        );
        closeAfterFailure(activeConnection, error);
      });
      activeConnection.on("close", () => {
        if (connection !== activeConnection) return;
        logger.warn("RabbitMQ connection closed");
        connection = undefined;
        channel = undefined;
        consumerTag = undefined;
        scheduleReconnect();
      });

      activeChannel = await activeConnection.createConfirmChannel();
      if (stopped || connection !== activeConnection) {
        await activeChannel.close().catch(() => {});
        return;
      }
      channel = activeChannel;

      activeChannel.on("error", (error) => {
        logger.error(`RabbitMQ channel error (${errorSummary(error).code})`);
        closeAfterFailure(activeConnection, error);
      });
      activeChannel.on("close", () => {
        if (channel !== activeChannel) return;
        logger.warn("RabbitMQ notification channel closed");
        connection = undefined;
        channel = undefined;
        consumerTag = undefined;
        scheduleReconnect();
        void activeConnection.close().catch(() => {});
      });

      await activeChannel.assertQueue(QUEUE_NAME, { durable: true });
      await activeChannel.assertQueue(RETRY_QUEUE_NAME, {
        durable: true,
        messageTtl: RETRY_DELAY_MS,
        deadLetterExchange: "",
        deadLetterRoutingKey: QUEUE_NAME,
      });
      await activeChannel.assertQueue(DEAD_LETTER_QUEUE_NAME, {
        durable: true,
      });
      await activeChannel.prefetch(1);

      const result = await activeChannel.consume(
        QUEUE_NAME,
        (message) => handleDelivery(activeConnection, activeChannel, message),
        { noAck: false }
      );
      if (stopped || connection !== activeConnection || channel !== activeChannel) {
        await activeChannel.close().catch(() => {});
        return;
      }
      consumerTag = result.consumerTag;
      logger.info(
        `RabbitMQ consumer registered for ${QUEUE_NAME}; one active consumer is ready`
      );
    } catch (error) {
      logger.error(
        `RabbitMQ setup failed (${errorSummary(error).code}); HTTP service remains available`
      );
      if (connection === activeConnection) {
        connection = undefined;
        channel = undefined;
        consumerTag = undefined;
      }
      if (activeChannel) await activeChannel.close().catch(() => {});
      if (activeConnection) await activeConnection.close().catch(() => {});
      scheduleReconnect();
    } finally {
      connecting = false;
    }
  }

  async function stop() {
    stopped = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = undefined;

    const activeChannel = channel;
    const activeConnection = connection;
    channel = undefined;
    connection = undefined;
    consumerTag = undefined;

    if (activeChannel) await activeChannel.close().catch(() => {});
    if (activeConnection) await activeConnection.close().catch(() => {});
  }

  return { ready: connectQueue(), stop };
}

module.exports = {
  createNotificationConsumer,
  isTransientSmtpError,
};
