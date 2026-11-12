# API Gateway

The Gateway on port 3002 handles user signup/signin, JWT authentication, role checks, rate limiting, and authenticated proxy requests to Flight and Booking services. The monorepo setup, database creation, startup order, and end-to-end PowerShell example are in the [root README](../README.md).

## Local setup

From the repository root, create `Flight-API-Gateway/.env` from `.env.example`, configure the local MySQL account and a private JWT secret, create `api_gateway_db`, then run:

```powershell
Set-Location .\Flight-API-Gateway
npm ci
npx sequelize-cli db:migrate --config src/config/config.js --migrations-path src/migrations --env development
npx sequelize-cli db:seed:all --config src/config/config.js --seeders-path src/seeders --env development
npm run dev
```

The service loads its own `.env`. Do not run Sequelize initialization commands: this repository already contains its configuration, migrations, and seeders. Do not commit `.env` or JWT secrets.

## Routes

| Method | Route | Access / purpose |
| --- | --- | --- |
| POST | `/api/v1/user/signup` | Public customer registration; JSON `{ "email": "...", "password": "..." }` |
| POST | `/api/v1/user/signin` | Public login with the same JSON fields; response `data` contains the JWT |
| GET | `/api/v1/info` | Protected Gateway info endpoint |
| POST | `/api/v1/user/role` | Admin-only role assignment |
| POST | `/api/v1/user/addAdminRole` | Admin-only role assignment |
| POST | `/api/v1/user/addFlightCompanyRole` | Admin-only role assignment |
| any proxied method | `/flightsService/*` | Authenticated request proxied to Flight Service at `FLIGHT_SERVICE` |
| any proxied method | `/bookingService/*` | Authenticated request proxied to Booking Service at `BOOKING_SERVICE` |

Pass the JWT in the `x-access-token` header on protected requests. The proxy removes its service prefix before forwarding. A new local database can be seeded with roles and sample users; for a known demo login, register a customer through signup.

## Environment variables

See [.env.example](.env.example). Configure `PORT` (default demo port 3002), `SALT_ROUNDS`, a private `JWT_SECRET`, `JWT_EXPIRY`, local Flight and Booking base URLs, and the Gateway database credentials/name/host/dialect. Keep `DB_NAME=api_gateway_db` when following the root guide. Tested dependencies and the four-service workflow are documented at the repository root.
