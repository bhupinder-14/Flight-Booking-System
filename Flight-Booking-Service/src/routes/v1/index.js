const express = require("express");
const router = express.Router();
const { InfoController } = require("../../controllers");
const bookingRoutes = require("./booking");

router.get("/info", InfoController.info);
router.use("/bookings", bookingRoutes);

module.exports = router;
