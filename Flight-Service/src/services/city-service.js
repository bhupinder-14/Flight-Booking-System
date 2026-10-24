const { StatusCodes } = require("http-status-codes");
const { CityRepository } = require("../repositories");
const AppError = require("../utils/errors/app-error");
const cityRepository = new CityRepository(); // creating airplane model

async function createCity(data) {
    try {
        const city = await cityRepository.create(data);
        return city;
    } catch (error) {
        if (
            error.name == "SequelizeValidationError" ||
            error.name == "SequelizeUniqueConstraintError"
        ) {
            let explanation = [];
            error.errors.forEach((e) => {
                explanation.push(e.message);
            });
            throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        }

        throw new AppError(
            "Cannot create a new city object.",
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getCities() {
    try {
        const response = cityRepository.getAll();
        return response;
    } catch (error) {
        throw new AppError(
            "Cannot fetch data of all the cities.",
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getCity(id) {
    try {
        const city = cityRepository.get(id);
        return city;
    } catch (error) {
        if (error.statusCode == StatusCodes.NOT_FOUND) {
            throw new AppError(
                "The city you requested not found.",
                StatusCodes.NOT_FOUND
            );
        }
        throw new AppError(
            "Cannot fetch data of the city.",
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function destroyCity(id) {
    try {
        const city = cityRepository.destroy(id);
        return city;
    } catch (error) {
        if (error.statusCode == StatusCodes.NOT_FOUND) {
            throw new AppError(
                "The city you requested to delete not found.",
                StatusCodes.NOT_FOUND
            );
        }
        throw new AppError(
            "Cannot fetch data of the city.",
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function updateCity(id, data) {
    try {
        const city = await cityRepository.update(id, data);
        return city;
    } catch (error) {
        if (error.statusCode === 404) {
            throw new AppError(
                "City to update not found",
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
            "Cannot update the city object.",
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

module.exports = {
    createCity,
    getCities,
    getCity,
    destroyCity,
    updateCity,
};
