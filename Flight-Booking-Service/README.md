# Booking Service

Handles the creation, cancellation, and payment for flight bookings.

## Features
- Creates new bookings with cost calculation
- Communicates with the Flight Service to check and update seat availability
- Manages booking status (`BOOKED`, `CANCELLED`)
- Uses Sequelize transactions for consistency
- Emits notifications via RabbitMQ

## Setup
- Requires connection to Flight Service and RabbitMQ
- Configure environment variables in `.env`
