"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          email: "user1@email.com",
          password:
            "$2a$08$KZ/j0O7mPrMhk.Dy6RdZ0e9L0s7AJXNO0QVPGm2.7rPWPOaQjXAgK",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "user2@gmail.com",
          password:
            "$2a$08$KZ/j0O7mPrMhk.Dy6RdZ0e9L0s7AJXNO0QVPGm2.7rPWPOaQjXAgK",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "user3@email.com",
          password:
            "$2a$08$KZ/j0O7mPrMhk.Dy6RdZ0e9L0s7AJXNO0QVPGm2.7rPWPOaQjXAgK",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {
        ignoreDuplicates: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
