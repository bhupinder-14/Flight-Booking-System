const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");
const { ErrorResponse } = require("../utils/common");

function validateCreateRequest(req, res, next) {
    if (!req.body.name) {
        ErrorResponse.message = "Something went wrong while creating City.";
        ErrorResponse.error = new AppError(
            ["name is not found in request body."],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

function validateUpdateRequest(req, res, next) {
    if (!req.body.name) {
        ErrorResponse.message = "Something went wrong while updating City.";
        ErrorResponse.error = new AppError(
            ["name is not found in request body."],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

module.exports = { validateCreateRequest, validateUpdateRequest };
