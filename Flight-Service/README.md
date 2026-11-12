# Flight Service

Flight Service listens on port 3000 and owns airport, city, airplane, flight, and seat availability data. The root [README](../README.md) covers the full monorepo setup and demo workflow.

## Local setup

Create `Flight-Service/.env` from [.env.example](.env.example), configure MySQL credentials and `flight_service_db`, and from the repository root run:

```powershell
Set-Location .\Flight-Service
npm ci
npx sequelize-cli db:migrate --config src/config/config.js --migrations-path src/migrations --env development
npx sequelize-cli db:seed:all --config src/config/config.js --seeders-path src/seeders --env development
npm run dev
```

The service loads its own `.env`. The existing migration and seeder directories are under `src`; do not run Sequelize initialization commands. Seeded flight departure times are generated relative to the time the flight seeder runs.

## Routes

Routes are mounted directly by the service and are also reached through the Gateway's `/flightsService/` proxy prefix.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/v1/info` | Service info |
| GET/POST | `/api/v1/airplanes` | List/create airplanes |
| GET/POST | `/api/v1/cities` | List/create cities |
| GET/POST | `/api/v1/airports` | List/create airports |
| GET/POST | `/api/v1/flights` | Search/list or create flights |
| GET | `/api/v1/flights/:id` | Fetch a flight |
| GET | `/api/v1/flights/:id/seats` | Fetch seat availability |

Flight search accepts `trips=FROM-TO`, `travellers`, `price`, `tripDate`, and `sort`. For example, `trips=MUM-DEL&travellers=1` searches one seat between Mumbai and Delhi. Sorting uses comma-separated field/direction entries such as `price_DESC,departureTime_ASC`.

## Environment variables

Set `PORT` (demo default 3000), `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `DB_HOST`, and `DB_DIALECT` in the service `.env`. Use `127.0.0.1` for a native Windows MySQL server and `flight_service_db` for the database in the root guide. No RabbitMQ or email configuration is used by this service.
