#!/bin/bash
set -e

echo "Waiting for MySQL to be ready..."
until nc -z "$DB_HOST" 3306; do
    >&2 echo "MySQL is unavailable - sleeping"
    sleep 2
done

>&2 echo "MySQL is up - executing command"

echo "Setting up database..."
cd /app/flight-service/src
npx sequelize db:create || true
npx sequelize db:migrate
npx sequelize db:seed:all

echo "Starting the application..."
cd /app/flight-service
exec "$@"
