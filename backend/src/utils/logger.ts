import winston from "winston";

import path from "path";


// Logs go to ./logs (project root, next to dist), not src/logs:
// src is not shipped to production, so a path under it would put
// runtime logs somewhere that only exists on a dev machine.

const logDir = path.join(process.cwd(), "logs");


export const logger = winston.createLogger({

    level:
        process.env.LOG_LEVEL ||
        (process.env.NODE_ENV === "production"
            ? "info"
            : "debug"),


    format: winston.format.combine(

        winston.format.timestamp(),

        winston.format.errors({ stack: true }),

        winston.format.json()

    ),


    defaultMeta: {
        service: "my-treats-api"
    },


    transports: [

        new winston.transports.File({

            filename: path.join(logDir, "error.log"),

            level: "error",

            maxsize: 5 * 1024 * 1024,

            maxFiles: 5

        }),


        new winston.transports.File({

            filename: path.join(logDir, "combined.log"),

            maxsize: 5 * 1024 * 1024,

            maxFiles: 5

        })

    ]

});


// Outside production, also print readable lines to the console.

if (process.env.NODE_ENV !== "production") {

    logger.add(

        new winston.transports.Console({

            format: winston.format.combine(

                winston.format.colorize(),

                winston.format.simple()

            )

        })

    );

}


// Lets morgan write its HTTP lines through winston.

export const httpLogStream = {

    write: (message: string) => {

        logger.info(message.trim());

    }

};
