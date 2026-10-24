const cron = require("node-cron");
const { CRON_JOBS_EXECUTION_TIME } = require("./enums");

function scheduleCrons() {
    cron.schedule(`*/${CRON_JOBS_EXECUTION_TIME} * * * *`, async () => {
        try {
            console.log("CRON JOB");
            await require("../../services").BookingService.cancelOldBookings();
        } catch (error) {
            console.error("Error in cancelOldBookings:", error);
        }
    });
}

module.exports = scheduleCrons;
