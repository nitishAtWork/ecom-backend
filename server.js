require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

const {
    verifyMailConnection,
} = require("./src/config/mail");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        await verifyMailConnection();

        app.listen(PORT, () => {
            console.log(
                `Server running on http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "Server startup failed:",
            error.message
        );

        process.exit(1);
    }
};

startServer();