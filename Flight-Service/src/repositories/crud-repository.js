const { StatusCodes } = require("http-status-codes");
const { Logger } = require("../config");
const AppError = require("../utils/errors/app-error");

class CrudRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        const response = await this.model.create(data);
        return response;
    }

    async destroy(id) {
        const response = await this.model.destroy({
            where: {
                id: id,
            },
        });
        if (!response) {
            throw new AppError(
                "Resourse to delete not found",
                StatusCodes.NOT_FOUND
            );
        }
        return response;
    }

    async get(data) {
        const response = await this.model.findByPk(data);
        if (!response) {
            throw new AppError("Resourse not found", StatusCodes.NOT_FOUND);
        }
        return response;
    }

    async getAll(data) {
        const response = await this.model.findAll(data);
        return response;
    }

    async update(id, data) {
        // data -> {col: value, ...}
        const record = await this.model.findByPk(id); // Find the record by ID
        if (!record) {
            throw new AppError(
                "Record to update not found", // Updated error message
                StatusCodes.NOT_FOUND
            );
        }

        // Perform the update
        const [affectedRows] = await this.model.update(data, {
            where: { id: id },
        });

        if (affectedRows === 0) {
            throw new AppError(
                "No records were updated", // Handle case where no records were updated
                StatusCodes.BAD_REQUEST
            );
        }

        // Optionally return the updated record (you may want to reload it from the database)
        const updatedRecord = await this.model.findByPk(id); // Fetch the updated record
        return updatedRecord;
    }
}

module.exports = CrudRepository;
