import {
    Request,
    Response,
    NextFunction
} from "express";

import { Role } from "../generated/prisma/client";

import { verifyToken } from "../utils/jwt";


export interface AuthUser {

    id: number;

    role: Role;

}


export interface AuthRequest extends Request {

    user?: AuthUser;

}


// VERIFY JWT AND ATTACH USER

export const protect = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {


    try {


        const token =
            req.headers.authorization
                ?.split(" ")[1];


        if (!token) {

            res.status(401).json({

                message: "Authentication required"

            });

            return;

        }


        const decoded = verifyToken(token);


        req.user = {
            id: decoded.id,
            role: decoded.role
        };


        next();


    }

    catch (error) {

        res.status(401).json({

            message: "Invalid token"

        });

    }


};


// `adminOnly` lives in ./admin.middleware.ts — it checks the
// role against the database instead of trusting the token.
