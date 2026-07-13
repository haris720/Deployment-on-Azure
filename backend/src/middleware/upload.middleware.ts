import multer, { FileFilterCallback } from "multer";

import { Request } from "express";

import crypto from "crypto";

import path from "path";

import fs from "fs";

import { AppError } from "./error.middleware";


export const UPLOAD_DIR =
    path.join(process.cwd(), "uploads");


// multer does not create the directory; without this the first
// upload fails with ENOENT.

fs.mkdirSync(UPLOAD_DIR, { recursive: true });


const ALLOWED_MIME = new Set([

    "image/jpeg",

    "image/png",

    "image/webp",

    "image/gif"

]);


const EXTENSION: Record<string, string> = {

    "image/jpeg": ".jpg",

    "image/png": ".png",

    "image/webp": ".webp",

    "image/gif": ".gif"

};


const storage = multer.diskStorage({

    destination: (_req, _file, cb) => {

        cb(null, UPLOAD_DIR);

    },


    // The filename is derived from a random id plus an extension
    // we choose from the mime type. Using file.originalname (as
    // the guide does) puts an attacker-controlled string into a
    // filesystem path — "../../server.js" escapes the uploads
    // folder, and a repeated name overwrites an existing image.

    filename: (_req, file, cb) => {

        const id = crypto.randomBytes(16).toString("hex");

        cb(
            null,
            `${Date.now()}-${id}${EXTENSION[file.mimetype] ?? ".bin"}`
        );

    }

});


const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {


    if (!ALLOWED_MIME.has(file.mimetype)) {

        cb(
            new AppError(
                "Only JPEG, PNG, WebP and GIF images are allowed",
                400
            )
        );

        return;

    }


    cb(null, true);

};


export const upload = multer({

    storage,

    fileFilter,

    limits: {

        // Without a limit, one request can fill the VM's disk.

        fileSize: 5 * 1024 * 1024,

        files: 5

    }

});
