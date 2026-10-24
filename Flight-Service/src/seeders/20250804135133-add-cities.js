"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Cities",
      [
        {
          id: 1,
          name: "Delhi",
          createdAt: new Date("2025-03-02 10:53:22"),
          updatedAt: new Date("2025-03-02 10:53:22"),
        },
        {
          id: 15,
          name: "Kolkata",
          createdAt: new Date("2025-03-12 18:08:37"),
          updatedAt: new Date("2025-03-12 18:08:37"),
        },
        {
          id: 16,
          name: "Mumbai",
          createdAt: new Date("2025-03-12 18:08:45"),
          updatedAt: new Date("2025-03-12 18:08:45"),
        },
        {
          id: 17,
          name: "Bangaluru",
          createdAt: new Date("2025-03-12 18:09:26"),
          updatedAt: new Date("2025-03-12 18:09:26"),
        },
        {
          id: 18,
          name: "Lucknow",
          createdAt: new Date("2025-08-02 04:43:42"),
          updatedAt: new Date("2025-08-02 04:43:42"),
        },
      ],
      {
        ignoreDuplicates: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Cities", null, {});
  },
};
