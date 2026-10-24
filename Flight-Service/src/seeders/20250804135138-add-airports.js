"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Airports",
      [
        {
          name: "Indira Gandhi International Airport",
          code: "DEL",
          address: null,
          cityId: 1,
          createdAt: new Date("2025-03-12 18:21:30"),
          updatedAt: new Date("2025-08-02 07:15:23"),
        },
        {
          name: "CSI Airport",
          code: "MUM",
          address: null,
          cityId: 16,
          createdAt: new Date("2025-03-12 18:22:42"),
          updatedAt: new Date("2025-03-12 18:22:42"),
        },
        {
          name: "Kempegawds Airport",
          code: "BLR",
          address: null,
          cityId: 17,
          createdAt: new Date("2025-03-12 18:23:25"),
          updatedAt: new Date("2025-03-12 18:23:25"),
        },
        {
          name: "Lucknow Airport",
          code: "LKO",
          address: null,
          cityId: 18,
          createdAt: new Date("2025-08-02 04:47:30"),
          updatedAt: new Date("2025-08-02 04:47:30"),
        },
      ],
      {
        ignoreDuplicates: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Airports", null, {});
  },
};
