"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Airplanes", [
      {
        modelNumber: "airbus340",
        capacity: 900,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelNumber: "boeing777",
        capacity: 450,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelNumber: "airbusA320",
        capacity: 180,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelNumber: "boeing737",
        capacity: 215,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelNumber: "embraerE190",
        capacity: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelNumber: "airbusA380",
        capacity: 525,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        modelNumber: "boeing787",
        capacity: 330,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Airplanes", null, {});
  },
};
