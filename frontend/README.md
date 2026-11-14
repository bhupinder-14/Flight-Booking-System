# Aether Frontend

Premium React frontend for the Flight Booking System monorepo.

## Run locally

1. Start MySQL, RabbitMQ, and the four backend services using the instructions in the repository root README.
2. From the repository root, open a new PowerShell window:

```powershell
Set-Location .\frontend
npm install
npm run dev
```

3. Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

The Vite development server proxies `/api`, `/flightsService`, and `/bookingService` to `http://localhost:3002`. This keeps browser requests on the frontend origin while the API Gateway continues to proxy to the Flight and Booking services. No browser-to-microservice calls are made.

To use a different Gateway URL, set `VITE_API_BASE_URL` in a local `.env` file. Leave it empty for the built-in local proxy. Do not put service credentials or JWT secrets in frontend environment variables.

## Implemented journey

- Customer signup and signin through `POST /api/v1/user/signup` and `POST /api/v1/user/signin`.
- Authenticated airport list from `GET /flightsService/api/v1/airports`.
- One-way flight search from `GET /flightsService/api/v1/flights?trips=FROM-TO&travellers=N&tripDate=YYYY-MM-DD&sort=price_ASC`.
- Traveller-name collection in the checkout UI.
- Booking creation through `POST /bookingService/api/v1/bookings` with the backend's existing request shape: `flightId`, `userId`, and `noofSeats`.
- Clearly labelled simulated payment through `POST /bookingService/api/v1/bookings/payments` with `x-idempotency-key`.

All protected requests send the JWT in the `x-access-token` header. Signup is followed by signin because the Gateway signup endpoint returns a user record while signin returns the JWT.

## Current backend contract limitations

The frontend intentionally does not invent APIs:

- The current Booking Service exposes booking creation and payment, but no customer booking-history endpoint. “My trips” therefore shows only completed demo bookings stored in this browser's local storage. It is not server-synchronised and clearing browser data removes this local list.
- The checkout collects passenger names for the current session, but the current Booking API does not accept or persist passenger records. The UI discloses this before reservation.
- Payment is a simulated backend state change. No card data is collected and no real payment provider is integrated.
- Search is one-way because the Flight Service search contract currently accepts a single `tripDate` and `trips=FROM-TO` pair.

These limitations are displayed in the relevant screens rather than represented as completed backend capabilities.

## Build

```powershell
npm run build
npm run preview
```

The project uses React, Vite, Tailwind CSS, and Lucide icons.
