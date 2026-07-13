import jwt, { SignOptions } from "jsonwebtoken";

import { Role } from "../generated/prisma/client";


export interface TokenPayload {

    id: number;

    role: Role;

}


export const generateToken = (
    userId: number,
    role: Role
) => {

    return jwt.sign(
        {
            id: userId,
            role
        },

        process.env.JWT_SECRET!,

        {
            expiresIn:
                (process.env.JWT_EXPIRES ||
                    "7d") as SignOptions["expiresIn"]
        }
    );

};


export const verifyToken = (
    token: string
): TokenPayload => {

    return jwt.verify(
        token,
        process.env.JWT_SECRET!
    ) as TokenPayload;

};
