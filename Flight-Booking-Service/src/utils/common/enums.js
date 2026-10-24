const SEAT_TYPE = {
    BUSINESS: "business",
    ECONOMY: "economy",
    PREMIUM_ECONOMY: "premium-economy",
    FIRST_CLASS: "first-class",
};

const BOOKING_STATUS = {
    BOOKED: "booked",
    CANCELLED: "cancelled",
    INITIATED: "initiated",
    PENDING: "pending",
};

const FLIGHT_BOOKING_EXPIRATION_TIME = 5; // in mins
const CRON_JOBS_EXECUTION_TIME = 30;

module.exports = {
    SEAT_TYPE,
    BOOKING_STATUS,
    FLIGHT_BOOKING_EXPIRATION_TIME,
    CRON_JOBS_EXECUTION_TIME,
};
