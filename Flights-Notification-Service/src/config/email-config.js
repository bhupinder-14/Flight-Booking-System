const nodemailer = require("nodemailer");

const { GMAIL_EMAIL, GMAIL_PASS } = require("./server-config");

const smtpConfigured = Boolean(GMAIL_EMAIL?.trim() && GMAIL_PASS?.trim());
const mailer = smtpConfigured
    ? nodemailer.createTransport({
          service: "Gmail",
          auth: {
              user: GMAIL_EMAIL,
              pass: GMAIL_PASS,
          },
      })
    : null;

module.exports = { mailer, smtpConfigured };
