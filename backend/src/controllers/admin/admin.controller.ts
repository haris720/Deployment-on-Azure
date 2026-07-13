import { Request, Response } from "express";

import prisma from "../../config/database";

import { Role } from "../../generated/prisma/client";


// A user row carries the bcrypt hash, so admin endpoints
// select explicit columns rather than `include: { user: true }`.

const adminUserSelect = {

    id: true,

    name: true,

    email: true,

    role: true,

    createdAt: true

};


// DASHBOARD STATISTICS

export const dashboard = async (
    _req: Request,
    res: Response
): Promise<void> => {


    try {


        const [

            users,

            admins,

            restaurants,

            activeRestaurants,

            categories,

            reviews,

            reservations,

            pendingReservations

        ] = await Promise.all([

            prisma.user.count(),

            prisma.user.count({
                where: {
                    role: "ADMIN"
                }
            }),

            prisma.restaurant.count(),

            prisma.restaurant.count({
                where: {
                    isActive: true
                }
            }),

            prisma.category.count(),

            prisma.review.count(),

            prisma.reservation.count(),

            prisma.reservation.count({
                where: {
                    status: "PENDING"
                }
            })

        ]);


        res.json({

            users,

            admins,

            restaurants,

            activeRestaurants,

            categories,

            reviews,

            reservations,

            pendingReservations

        });


    }

    catch (error) {

        console.error("Dashboard failed", error);

        res.status(500).json({

            message: "Dashboard failed"

        });

    }


};


// GET ALL USERS

export const getUsers = async (
    _req: Request,
    res: Response
): Promise<void> => {


    try {


        const users =
            await prisma.user.findMany({

                select: {

                    ...adminUserSelect,

                    _count: {

                        select: {

                            reviews: true,

                            reservations: true

                        }

                    }

                },

                orderBy: {
                    createdAt: "desc"
                }

            });


        res.json({

            users

        });


    }

    catch (error) {

        console.error("Fetching users failed", error);

        res.status(500).json({

            message: "Fetching users failed"

        });

    }


};


// CHANGE A USER'S ROLE

export const updateUserRole = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const id = Number(req.params.id);

        const { role } = req.body ?? {};


        if (!Number.isInteger(id)) {

            res.status(400).json({

                message: "Invalid user id"

            });

            return;

        }


        if (role !== "USER" && role !== "ADMIN") {

            res.status(400).json({

                message: "role must be USER or ADMIN"

            });

            return;

        }


        // Demoting yourself could leave the platform with no
        // admin and lock everyone out of this panel.

        if (id === req.user!.id) {

            res.status(400).json({

                message: "You cannot change your own role"

            });

            return;

        }


        const target =
            await prisma.user.findUnique({

                where: {
                    id
                }

            });


        if (!target) {

            res.status(404).json({

                message: "User not found"

            });

            return;

        }


        const user =
            await prisma.user.update({

                where: {
                    id
                },

                data: {
                    role: role as Role
                },

                select: adminUserSelect

            });


        res.json({

            message: "User role updated",

            user

        });


    }

    catch (error) {

        console.error("Role update failed", error);

        res.status(500).json({

            message: "Role update failed"

        });

    }


};


// DELETE USER

export const deleteUser = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const id = Number(req.params.id);


        if (!Number.isInteger(id)) {

            res.status(400).json({

                message: "Invalid user id"

            });

            return;

        }


        if (id === req.user!.id) {

            res.status(400).json({

                message: "You cannot delete your own account"

            });

            return;

        }


        const target =
            await prisma.user.findUnique({

                where: {
                    id
                }

            });


        if (!target) {

            res.status(404).json({

                message: "User not found"

            });

            return;

        }


        // A plain user.delete() fails with a foreign-key error
        // as soon as the user has any reviews, favorites, lists
        // or reservations. Their content is removed first, in a
        // transaction, so the delete is all-or-nothing.

        await prisma.$transaction([

            prisma.listRestaurant.deleteMany({

                where: {

                    list: {
                        userId: id
                    }

                }

            }),

            prisma.userList.deleteMany({
                where: {
                    userId: id
                }
            }),

            prisma.favorite.deleteMany({
                where: {
                    userId: id
                }
            }),

            prisma.review.deleteMany({
                where: {
                    userId: id
                }
            }),

            prisma.reservation.deleteMany({
                where: {
                    userId: id
                }
            }),

            prisma.user.delete({
                where: {
                    id
                }
            })

        ]);


        res.json({

            message:
                "User and their reviews, favorites, lists and reservations deleted"

        });


    }

    catch (error) {

        console.error("User delete failed", error);

        res.status(500).json({

            message: "User delete failed"

        });

    }


};


// ALL RESERVATIONS ACROSS THE PLATFORM

export const getReservations = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const { status } = req.query;


        const reservations =
            await prisma.reservation.findMany({

                where: {

                    status: status
                        ? (String(status) as any)
                        : undefined

                },

                include: {

                    user: {
                        select: adminUserSelect
                    },

                    restaurant: true

                },

                orderBy: {
                    reservationDate: "asc"
                }

            });


        res.json({

            reservations

        });


    }

    catch (error) {

        console.error("Fetching reservations failed", error);

        res.status(500).json({

            message: "Fetching reservations failed"

        });

    }


};


// ALL REVIEWS ACROSS THE PLATFORM

export const getReviews = async (
    _req: Request,
    res: Response
): Promise<void> => {


    try {


        const reviews =
            await prisma.review.findMany({

                include: {

                    user: {

                        select: {

                            id: true,

                            name: true

                        }

                    },

                    restaurant: {

                        select: {

                            id: true,

                            name: true

                        }

                    }

                },

                orderBy: {
                    createdAt: "desc"
                }

            });


        res.json({

            reviews

        });


    }

    catch (error) {

        console.error("Fetching reviews failed", error);

        res.status(500).json({

            message: "Fetching reviews failed"

        });

    }


};
