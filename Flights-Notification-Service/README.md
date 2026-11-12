# Notification Service

Notification Service listens on port 3003. It consumes booking notifications from RabbitMQ queue `noti-queue`, records them in local logs when SMTP settings are absent, and can send the existing confirmation email when Gmail SMTP credentials are configured. It also exposes a ticket-record API. The [root README](../README.md) documents the complete Windows setup.

## Local setup

Create `Flights-Notification-Service/.env` from [.env.example](.env.example), configure MySQL credentials and `notification_service_db`, then from the repository root run:

```powershell
Set-Location .\Flights-Notification-Service
npm ci
npx sequelize-cli db:migrate --config src/config/config.js --migrations-path src/migrations --env development
npm run dev
```

There are no notification seeders. The service loads its own `.env`. RabbitMQ must be reachable at the URL currently configured in the service; the AMQP connection requests `frameMax=8192` for RabbitMQ 4.4 compatibility.

## Notification behavior

- Leave `GMAIL_EMAIL` and `GMAIL_PASS` blank for local demos. The consumer logs selected booking/flight notification details, explicitly says email was skipped, and acknowledges after that local logging succeeds. This is not successful email delivery.
- If both are configured, the existing email template is sent using Nodemailer. A message is acknowledged only after successful delivery. Transient SMTP failures have bounded retries; exhausted or permanent failures are routed to the dead-letter queue instead of being silently acknowledged. Retry messages use `noti-queue.retry`; dead letters use `noti-queue.dead`.
- RabbitMQ uses the AMQP port 5672; no management plugin is needed. Booking Service publishes to the same `noti-queue` queue.

For real delivery, configure a Gmail address and an app password where Google account settings support one. Never commit credentials. Keep all other notification configuration in [.env.example](.env.example) and configure `PORT`, database name/account/host/dialect locally.

## Routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/v1/info` | Service info |
| POST | `/api/v1/tickets` | Create a ticket record in this service's database |

Queue consumption is a background process independent of the ticket API route. Notification Service owns `notification_service_db`; its schema is created by the migration above.
