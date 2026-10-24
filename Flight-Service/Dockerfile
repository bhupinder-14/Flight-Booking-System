FROM node:18

# Install netcat for connection testing and curl for health checks
RUN apt-get update && apt-get install -y netcat-openbsd curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app/flight-service

COPY package*.json ./
RUN npm install

COPY . .

# Make entrypoint script executable
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "dev"]
