const emailConfig = require("./email-config");

module.exports = {
    ServerConfig: require("./server-config"),
    Logger: require("./logger-config"),
    MAILER: emailConfig.mailer,
    SMTP_CONFIGURED: emailConfig.smtpConfigured,
};
