import {
    Request,
    Response,
    NextFunction
} from "express";

import { MulterError } from "multer";

import { logger } from "../utils/logger";


export class AppError extends Error {

    statusCode: number;


    constructor(message: string, statusCode = 500) {

        super(message);

        this.statusCode = statusCode;

    }

}


// Unmatched route -> 404 instead of Express's default HTML page.

export const notFound = (
    req: Request,
    res: Response
): void => {

    res.status(404).json({

        success: false,

        message: `Route ${req.method} ${req.originalUrl} not found`

    });

};


// Must be registered last, after all routes.

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {


    // Rejected uploads (too large, too many, wrong field) are the
    // caller's mistake, not a server fault.

    if (err instanceof MulterError) {

        const tooLarge = err.code === "LIMIT_FILE_SIZE";


        logger.warn(`Upload rejected: ${err.code}`);


        res.status(400).json({

            success: false,

            message: tooLarge
                ? "Image must be 5MB or smaller"
                : `Upload rejected: ${err.message}`

        });

        return;

    }


    const statusCode =
        err.statusCode && err.statusCode >= 400
            ? err.statusCode
            : 500;


    logger.error(err.message, {

        method: req.method,

        url: req.originalUrl,

        statusCode,

        stack: err.stack

    });


    // A 500 means an unexpected failure, and err.message can hold
    // database internals or file paths. Only send our own messages
    // (4xx) to the client; log the rest and stay generic.

    const message =
        statusCode < 500
            ? err.message
            : "Internal Server Error";


    res.status(statusCode).json({

        success: false,

        message

    });

};
