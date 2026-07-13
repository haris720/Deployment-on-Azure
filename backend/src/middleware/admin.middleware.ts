import {
    Request,
    Response,
    NextFunction
} from "express";

import prisma from "../config/database";


// RESTRICT ROUTE TO ADMINS
// Must run after `protect`.
//
// The role is re-read from the database rather than trusted
// from the JWT: tokens live for 7 days, so a demoted admin's
// existing token would still claim ADMIN until it expired.
// This costs one query per admin request and revokes access
// the moment the role changes.

export const adminOnly = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {


    try {


        const user =
            await prisma.user.findUnique({

                where: {
                    id: req.user!.id
                },

                select: {

                    id: true,

                    role: true

                }

            });


        if (!user) {

            res.status(404).json({

                message: "User not found"

            });

            return;

        }


        if (user.role !== "ADMIN") {

            res.status(403).json({

                message: "Admin access required"

            });

            return;

        }


        // Keep the request in sync with the stored role.

        req.user!.role = user.role;


        next();


    }

    catch (error) {

        console.error("Authorization failed", error);

        res.status(500).json({

            message: "Authorization failed"

        });

    }


};
