"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, remove existing foreign key constraints if they exist
    try {
      await queryInterface.removeConstraint("Flights", "flights_ibfk_2");
    } catch (error) {
      // Constraint might not exist, continue
    }

    try {
      await queryInterface.removeConstraint("Flights", "flights_ibfk_3");
    } catch (error) {
      // Constraint might not exist, continue
    }

    // Remove existing data if any (since we're changing the data type)
    await queryInterface.bulkDelete("Flights", {}, {});

    // Add explicit foreign key constraints
    await queryInterface.addConstraint("Flights", {
      type: "foreign key",
      name: "departure_airport_fkey_constraint",
      fields: ["departureAirportId"],
      references: {
        table: "Airports",
        field: "code",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add foreign key constraint for arrivalAirportId
    await queryInterface.addConstraint("Flights", {
      type: "foreign key",
      name: "arrival_airport_fkey_constraint",
      fields: ["arrivalAirportId"],
      references: {
        table: "Airports",
        field: "code",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove foreign key constraints
    await queryInterface.removeConstraint(
      "Flights",
      "departure_airport_fkey_constraint"
    );
    await queryInterface.removeConstraint(
      "Flights",
      "arrival_airport_fkey_constraint"
    );
  },
};
