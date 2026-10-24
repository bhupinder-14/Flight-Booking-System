const express = require("express");
const { ServerConfig, Queue } = require("./config");
const apiRoutes = require("./routes");
const CRON = require("./utils/common/cron-jobs");
const amqplib = require("amqplib");

async function connectQueue() {
    try {
        const connection = await amqplib.connect("amqp://localhost");
        const channel = await connection.createChannel();

        await channel.assertQueue("noti-queue");
        channel.sendToQueue("noti-queue", Buffer.from("something to do"));
    } catch (error) {
        console.log(error);
    }
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRoutes);
app.use("/bookingService/api", apiRoutes);

app.listen(ServerConfig.PORT, async () => {
    console.log(`Server is listening on port ${ServerConfig.PORT}`);
    await Queue.connectQueue();
    CRON();
});
