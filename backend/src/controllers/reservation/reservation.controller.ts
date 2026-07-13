import { Request, Response } from "express";

import prisma from "../../config/database";

import { ReservationStatus } from "../../generated/prisma/client";


const isNotFoundError = (error: unknown) =>
    (error as { code?: string })?.code === "P2025";


const VALID_STATUSES: ReservationStatus[] = [

    "PENDING",

    "CONFIRMED",

    "CANCELLED",

    "COMPLETED"

];


const MAX_PEOPLE = 50;


// A restaurant's booking sheet contains other customers'
// names and requests, so it never exposes the password
// hash and is only reachable by an admin (see routes).

const reservationUserSelect = {

    select: {

        id: true,

        name: true,

        email: true

    }

};


// CREATE RESERVATION

export const createReservation = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const {

            restaurantId,

            reservationDate,

            people,

            specialRequest

        } = req.body ?? {};


        const restaurantIdNum = Number(restaurantId);

        const peopleNum = Number(people);


        if (!Number.isInteger(restaurantIdNum)) {

            res.status(400).json({

                message: "restaurantId is required"

            });

            return;

        }


        const date = new Date(reservationDate);


        // new Date("garbage") is an Invalid Date, which Prisma
        // would reject with an opaque 500.

        if (
            !reservationDate ||
            Number.isNaN(date.getTime())
        ) {

            res.status(400).json({

                message:
                    "reservationDate must be a valid date"

            });

            return;

        }


        if (date.getTime() <= Date.now()) {

            res.status(400).json({

                message:
                    "reservationDate must be in the future"

            });

            return;

        }


        if (
            !Number.isInteger(peopleNum) ||
            peopleNum < 1 ||
            peopleNum > MAX_PEOPLE
        ) {

            res.status(400).json({

                message:
                    `people must be a whole number between 1 and ${MAX_PEOPLE}`

            });

            return;

        }


        const restaurant =
            await prisma.restaurant.findUnique({

                where: {
                    id: restaurantIdNum
                }

            });


        if (!restaurant || !restaurant.isActive) {

            res.status(404).json({

                message: "Restaurant not found"

            });

            return;

        }


        const reservation =
            await prisma.reservation.create({

                data: {

                    restaurantId: restaurantIdNum,

                    reservationDate: date,

                    people: peopleNum,

                    specialRequest,

                    userId: req.user!.id

                },

                include: {
                    restaurant: true
                }

            });


        res.status(201).json({

            message: "Reservation created successfully",

            reservation

        });


    }


    catch (error) {

        console.error("Reservation creation failed", error);

        res.status(500).json({

            message: "Reservation creation failed"

        });

    }

};


// GET MY RESERVATIONS

export const getMyReservations = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const reservations =
            await prisma.reservation.findMany({

                where: {
                    userId: req.user!.id
                },

                include: {
                    restaurant: true
                },

                orderBy: {
                    createdAt: "desc"
                }

            });


        res.json({

            reservations

        });


    }


    catch (error) {

        console.error("Failed to fetch reservations", error);

        res.status(500).json({

            message: "Failed to fetch reservations"

        });

    }


};


// GET RESTAURANT RESERVATIONS (admin)

export const getRestaurantReservations = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const restaurantId =
            Number(req.params.restaurantId);


        if (!Number.isInteger(restaurantId)) {

            res.status(400).json({

                message: "Invalid restaurant id"

            });

            return;

        }


        const { status } = req.query;


        if (
            status &&
            !VALID_STATUSES.includes(
                String(status) as ReservationStatus
            )
        ) {

            res.status(400).json({

                message:
                    `status must be one of: ${VALID_STATUSES.join(", ")}`

            });

            return;

        }


        const reservations =
            await prisma.reservation.findMany({

                where: {

                    restaurantId,

                    status: status
                        ? (String(status) as ReservationStatus)
                        : undefined

                },

                include: {
                    user: reservationUserSelect
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

        console.error(
            "Failed to fetch restaurant reservations",
            error
        );

        res.status(500).json({

            message: "Failed to fetch restaurant reservations"

        });

    }


};


// UPDATE STATUS (admin)

export const updateReservationStatus = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const id = Number(req.params.id);

        const { status } = req.body ?? {};


        if (!Number.isInteger(id)) {

            res.status(400).json({

                message: "Invalid reservation id"

            });

            return;

        }


        // Without this check any string lands in the enum
        // column and Prisma fails with an opaque 500.

        if (
            !status ||
            !VALID_STATUSES.includes(
                status as ReservationStatus
            )
        ) {

            res.status(400).json({

                message:
                    `status must be one of: ${VALID_STATUSES.join(", ")}`

            });

            return;

        }


        const reservation =
            await prisma.reservation.update({

                where: {
                    id
                },

                data: {
                    status: status as ReservationStatus
                },

                include: {

                    restaurant: true,

                    user: reservationUserSelect

                }

            });


        res.json({

            message: "Reservation status updated",

            reservation

        });


    }


    catch (error) {

        if (isNotFoundError(error)) {

            res.status(404).json({

                message: "Reservation not found"

            });

            return;

        }


        console.error("Status update failed", error);

        res.status(500).json({

            message: "Status update failed"

        });

    }


};


// CANCEL RESERVATION (owner or admin)

export const cancelReservation = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const id = Number(req.params.id);


        if (!Number.isInteger(id)) {

            res.status(400).json({

                message: "Invalid reservation id"

            });

            return;

        }


        const existing =
            await prisma.reservation.findUnique({

                where: {
                    id
                }

            });


        if (!existing) {

            res.status(404).json({

                message: "Reservation not found"

            });

            return;

        }


        // Anyone logged in could otherwise cancel any
        // stranger's booking by guessing the id.

        if (
            existing.userId !== req.user!.id &&
            req.user!.role !== "ADMIN"
        ) {

            res.status(403).json({

                message:
                    "You can only cancel your own reservation"

            });

            return;

        }


        if (existing.status === "CANCELLED") {

            res.status(400).json({

                message: "Reservation is already cancelled"

            });

            return;

        }


        if (existing.status === "COMPLETED") {

            res.status(400).json({

                message:
                    "A completed reservation cannot be cancelled"

            });

            return;

        }


        const reservation =
            await prisma.reservation.update({

                where: {
                    id
                },

                data: {
                    status: "CANCELLED"
                },

                include: {
                    restaurant: true
                }

            });


        res.json({

            message: "Reservation cancelled",

            reservation

        });


    }


    catch (error) {

        console.error("Cancellation failed", error);

        res.status(500).json({

            message: "Cancellation failed"

        });

    }


};
