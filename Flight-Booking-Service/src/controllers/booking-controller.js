const { StatusCodes } = require("http-status-codes");
const { BookingService } = require("../services");
const { SuccessResponse, ErrorResponse } = require("../utils/common");

const inMemDb = {};

/**
 * POST: /bookings
 * req-body {
 *  flightId: 4,
 *  userId: 1,
 *  noofSeats: 2,
 * }
 */

async function createBooking(req, res) {
    try {
        const response = await BookingService.createBooking({
            flightId: req.body.flightId,
            userId: req.body.userId,
            noofSeats: req.body.noofSeats,
        });
        SuccessResponse.data = response;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

/**
 * POST: /bookings/payments
 *
 * req-headears {
 *  x-idempotency-key: unique-key-123
 * }
 *
 * req-body {
 *  totalCost: 4000,
 *  userId: 1,
 *  bookingId: 2,
 * }
 */

async function makePayment(req, res) {
    try {
        const idempotencyKey = req.headers["x-idempotency-key"];
        if (!idempotencyKey) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "idempotency key missing" });
        }
        if (inMemDb[idempotencyKey]) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Cannot retry on a successful payment" });
        }
        const response = await BookingService.makePayment({
            totalCost: req.body.totalCost,
            userId: req.body.userId,
            bookingId: req.body.bookingId,
        });
        inMemDb[idempotencyKey] = idempotencyKey;
        SuccessResponse.data = response;
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse);
    }
}

module.exports = {
    createBooking,
    makePayment,
};
