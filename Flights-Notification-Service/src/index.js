const express = require("express");
const { ServerConfig, Logger } = require("./config");
const apiRoutes = require("./routes");
const { createNotificationConsumer } = require("./services/notification-consumer");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRoutes);

const server = app.listen(ServerConfig.PORT || 3003, () => {
  Logger.info(`Server is listening on port ${ServerConfig.PORT || 3003}`);
  notificationConsumer = createNotificationConsumer();
});

let notificationConsumer;

function shutdown() {
  server.close();
  void notificationConsumer?.stop();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
