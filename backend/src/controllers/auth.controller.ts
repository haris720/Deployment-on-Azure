import { Request, Response } from "express";
import bcrypt from "bcrypt";

import prisma from "../config/database";

import { generateToken } from "../utils/jwt";


const SALT_ROUNDS = 10;


// REGISTER USER

export const register = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {


        const {
            name,
            email,
            password
        } = req.body;


        if (!name || !email || !password) {

            res.status(400).json({

                message:
                    "Name, email and password are required"

            });

            return;

        }


        const existingUser =
            await prisma.user.findUnique({

                where: {
                    email
                }

            });


        if (existingUser) {

            res.status(400).json({

                message: "Email already registered"

            });

            return;

        }


        const hashedPassword =
            await bcrypt.hash(password, SALT_ROUNDS);


        const user =
            await prisma.user.create({

                data: {

                    name,

                    email,

                    password: hashedPassword

                }

            });


        const token =
            generateToken(user.id, user.role);


        res.status(201).json({

            message: "User registered successfully",

            token,

            user: {

                id: user.id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });


    }

    catch (error) {

        console.error("Registration failed", error);

        res.status(500).json({

            message: "Registration failed"

        });

    }


};




// LOGIN USER


export const login = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            res.status(400).json({

                message:
                    "Email and password are required"

            });

            return;

        }


        const user =
            await prisma.user.findUnique({

                where: {
                    email
                }

            });


        if (!user) {

            res.status(401).json({

                message: "Invalid email or password"

            });

            return;

        }


        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            res.status(401).json({

                message: "Invalid email or password"

            });

            return;

        }


        const token =
            generateToken(user.id, user.role);


        res.json({

            message: "Login successful",

            token,

            user: {

                id: user.id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });


    }


    catch (error) {

        console.error("Login failed", error);

        res.status(500).json({

            message: "Login failed"

        });

    }


};




// CURRENT USER PROFILE


export const getProfile = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const user =
            await prisma.user.findUnique({

                where: {
                    id: req.user!.id
                },

                select: {

                    id: true,

                    name: true,

                    email: true,

                    role: true,

                    createdAt: true

                }

            });


        if (!user) {

            res.status(404).json({

                message: "User not found"

            });

            return;

        }


        res.json({

            message: "Protected route accessed",

            user

        });


    }


    catch (error) {

        console.error("Profile lookup failed", error);

        res.status(500).json({

            message: "Profile lookup failed"

        });

    }


};
