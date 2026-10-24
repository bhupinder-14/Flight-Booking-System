const { StatusCodes } = require("http-status-codes");
const { AirplaneRepository } = require("../repositories");
const AppError = require("../utils/errors/app-error");
const airplaneRepository = new AirplaneRepository(); // creating airplane model

async function createAirplane(data) {
    try {
        const airplane = await airplaneRepository.create(data);
        return airplane;
    } catch (error) {
        if ((error.name = "SequelizeValidationError")) {
            let explanation = [];
            error.errors.forEach((e) => {
                explanation.push(e.message);
            });
            throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        }
        throw new AppError(
            "Cannot create a new airplane object.",
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getAirplanes() {
    try {
        const response = airplaneRepository.getAll();
        return response;
    } catch (error) {
        throw new AppError(
            "Cannot fetch data of all the airplanes.",
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getAirplane(id) {
    try {
        const airplane = airplaneRepository.get(id);
        return airplane;
    } catch (error) {
        if (error.statusCode == StatusCodes.NOT_FOUND) {
            throw new AppError(
                "The airplane you requested not found.",
                StatusCodes.NOT_FOUND
            );
        }
        throw new AppError(
            "Cannot fetch data of the airplane.",
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function destroyAirplane(id) {
    try {
        const airplane = airplaneRepository.destroy(id);
        return airplane;
    } catch (error) {
        if (error.statusCode == StatusCodes.NOT_FOUND) {
            throw new AppError(
                "The airplane you requested to delete not found.",
                StatusCodes.NOT_FOUND
            );
        }
        throw new AppError(
            "Cannot fetch data of the airplane.",
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function updateAirplane(id, data) {
    try {
        const airplane = await airplaneRepository.update(id, data);
        return airplane;
    } catch (error) {
        if (error.statusCode === 404) {
            throw new AppError(
                "Airplane to update not found",
                StatusCodes.NOT_FOUND
            );
        }
        if ((error.name = "SequelizeValidationError")) {
            let explanation = [];
            error.errors.forEach((e) => {
                explanation.push(e.message);
            });
            throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        }

        throw new AppError(
            "Cannot update the airplane object.",
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

module.exports = {
    createAirplane,
    getAirplanes,
    getAirplane,
    destroyAirplane,
    updateAirplane,
};
