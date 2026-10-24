"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    function addHours(date, hours) {
      const d = new Date(date);
      d.setHours(d.getHours() + hours);
      return d;
    }
    await queryInterface.bulkInsert("Flights", [
      {
        flightNumber: "UK 808",
        airplaneId: "1",
        departureAirportId: "BLR",
        arrivalAirportId: "DEL",
        departureTime: now,
        arrivalTime: addHours(now, 4),
        price: 2000,
        boardingGate: "12A",
        totalSeats: 120,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        flightNumber: "AI 202",
        airplaneId: "2",
        departureAirportId: "DEL",
        arrivalAirportId: "MUM",
        departureTime: addHours(now, 6),
        arrivalTime: addHours(now, 9),
        price: 3500,
        boardingGate: "7B",
        totalSeats: 180,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        flightNumber: "6E 305",
        airplaneId: "3",
        departureAirportId: "MUM",
        arrivalAirportId: "LKO",
        departureTime: addHours(now, 12),
        arrivalTime: addHours(now, 15),
        price: 2200,
        boardingGate: "15C",
        totalSeats: 160,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        flightNumber: "SG 401",
        airplaneId: "4",
        departureAirportId: "LKO",
        arrivalAirportId: "BLR",
        departureTime: addHours(now, 18),
        arrivalTime: addHours(now, 20),
        price: 1800,
        boardingGate: "3A",
        totalSeats: 150,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        flightNumber: "IX 555",
        airplaneId: "5",
        departureAirportId: "BLR",
        arrivalAirportId: "MUM",
        departureTime: addHours(now, 24),
        arrivalTime: addHours(now, 26),
        price: 1700,
        boardingGate: "9D",
        totalSeats: 140,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        flightNumber: "QF 789",
        airplaneId: "6",
        departureAirportId: "MUM",
        arrivalAirportId: "DEL",
        departureTime: addHours(now, 30),
        arrivalTime: addHours(now, 34),
        price: 2600,
        boardingGate: "21E",
        totalSeats: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        flightNumber: "EK 123",
        airplaneId: "7",
        departureAirportId: "DEL",
        arrivalAirportId: "LKO",
        departureTime: addHours(now, 36),
        arrivalTime: addHours(now, 42),
        price: 8000,
        boardingGate: "5F",
        totalSeats: 300,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        flightNumber: "LH 789",
        airplaneId: "1",
        departureAirportId: "LKO",
        arrivalAirportId: "MUM",
        departureTime: addHours(now, 48),
        arrivalTime: addHours(now, 56),
        price: 12000,
        boardingGate: "18A",
        totalSeats: 350,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Flights", null, {});
  },
};
