import dotenv from "dotenv";

dotenv.config();


import app from "./app";
import prisma from "./config/database";
import { logger } from "./utils/logger";


const PORT = process.env.PORT || 5000;


// Fail fast on missing secrets rather than signing tokens with
// `undefined` and discovering it at the first login.

const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET"];

const missing = REQUIRED_ENV.filter(
    (key) => !process.env[key]
);

if (missing.length > 0) {

    logger.error(
        `Missing required environment variables: ${missing.join(", ")}`
    );

    process.exit(1);

}


prisma.$connect()
    .then(() => {

        logger.info("Database connected");


        const server = app.listen(PORT, () => {

            logger.info(
                `Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`
            );

        });


        // Azure/Docker stop the container with SIGTERM. Close the
        // HTTP server and database pool instead of dropping
        // in-flight requests.

        const shutdown = (signal: string) => {

            logger.info(`${signal} received, shutting down`);

            server.close(async () => {

                await prisma.$disconnect();

                process.exit(0);

            });

        };


        process.on("SIGTERM", () => shutdown("SIGTERM"));

        process.on("SIGINT", () => shutdown("SIGINT"));

    })
    .catch((error: Error) => {

        logger.error(
            "Database connection failed",
            {
                message: error.message
            }
        );

        process.exit(1);

    });
