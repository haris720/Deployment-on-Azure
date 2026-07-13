import { Request, Response } from "express";

import prisma from "../../config/database";


const isUniqueError = (error: unknown) =>
    (error as { code?: string })?.code === "P2002";


const isNotFoundError = (error: unknown) =>
    (error as { code?: string })?.code === "P2025";


// Never expose the password hash. `include: { user: true }`
// would ship it to every caller of the public reviews route.

const reviewUserSelect = {

    select: {

        id: true,

        name: true

    }

};


// ADD REVIEW

export const createReview = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const {
            restaurantId,
            rating,
            comment
        } = req.body ?? {};


        const restaurantIdNum = Number(restaurantId);

        const ratingNum = Number(rating);


        if (!Number.isInteger(restaurantIdNum)) {

            res.status(400).json({

                message: "restaurantId is required"

            });

            return;

        }


        if (
            !Number.isInteger(ratingNum) ||
            ratingNum < 1 ||
            ratingNum > 5
        ) {

            res.status(400).json({

                message:
                    "rating must be a whole number between 1 and 5"

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


        const review =
            await prisma.review.create({

                data: {

                    restaurantId: restaurantIdNum,

                    rating: ratingNum,

                    comment,

                    userId: req.user!.id

                },

                include: {
                    user: reviewUserSelect
                }

            });


        res.status(201).json({

            message: "Review added",

            review

        });


    }

    catch (error) {

        if (isUniqueError(error)) {

            res.status(400).json({

                message:
                    "You have already reviewed this restaurant"

            });

            return;

        }


        console.error("Review creation failed", error);

        res.status(500).json({

            message: "Review creation failed"

        });

    }


};


// UPDATE MY REVIEW

export const updateReview = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const id = Number(req.params.id);


        const {
            rating,
            comment
        } = req.body ?? {};


        if (!Number.isInteger(id)) {

            res.status(400).json({

                message: "Invalid review id"

            });

            return;

        }


        if (rating !== undefined) {

            const ratingNum = Number(rating);


            if (
                !Number.isInteger(ratingNum) ||
                ratingNum < 1 ||
                ratingNum > 5
            ) {

                res.status(400).json({

                    message:
                        "rating must be a whole number between 1 and 5"

                });

                return;

            }

        }


        const existing =
            await prisma.review.findUnique({

                where: {
                    id
                }

            });


        if (!existing) {

            res.status(404).json({

                message: "Review not found"

            });

            return;

        }


        // A user may only edit their own review.

        if (existing.userId !== req.user!.id) {

            res.status(403).json({

                message: "You can only edit your own review"

            });

            return;

        }


        const review =
            await prisma.review.update({

                where: {
                    id
                },

                data: {

                    rating:
                        rating === undefined
                            ? undefined
                            : Number(rating),

                    comment

                },

                include: {
                    user: reviewUserSelect
                }

            });


        res.json({

            message: "Review updated",

            review

        });


    }

    catch (error) {

        console.error("Review update failed", error);

        res.status(500).json({

            message: "Review update failed"

        });

    }


};


// DELETE MY REVIEW

export const deleteReview = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const id = Number(req.params.id);


        if (!Number.isInteger(id)) {

            res.status(400).json({

                message: "Invalid review id"

            });

            return;

        }


        const existing =
            await prisma.review.findUnique({

                where: {
                    id
                }

            });


        if (!existing) {

            res.status(404).json({

                message: "Review not found"

            });

            return;

        }


        // Owner or admin may delete.

        if (
            existing.userId !== req.user!.id &&
            req.user!.role !== "ADMIN"
        ) {

            res.status(403).json({

                message: "You can only delete your own review"

            });

            return;

        }


        await prisma.review.delete({

            where: {
                id
            }

        });


        res.json({

            message: "Review deleted"

        });


    }

    catch (error) {

        if (isNotFoundError(error)) {

            res.status(404).json({

                message: "Review not found"

            });

            return;

        }


        console.error("Review delete failed", error);

        res.status(500).json({

            message: "Review delete failed"

        });

    }


};


// GET RESTAURANT REVIEWS + AVERAGE RATING

export const getReviews = async (
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


        const [reviews, stats] =
            await Promise.all([

                prisma.review.findMany({

                    where: {
                        restaurantId
                    },

                    include: {
                        user: reviewUserSelect
                    },

                    orderBy: {
                        createdAt: "desc"
                    }

                }),


                prisma.review.aggregate({

                    where: {
                        restaurantId
                    },

                    _avg: {
                        rating: true
                    },

                    _count: {
                        rating: true
                    }

                })

            ]);


        res.json({

            reviews,

            rating: {

                average:
                    stats._avg.rating === null
                        ? null
                        : Number(
                            stats._avg.rating.toFixed(2)
                        ),

                count: stats._count.rating

            }

        });


    }

    catch (error) {

        console.error("Fetching reviews failed", error);

        res.status(500).json({

            message: "Fetching reviews failed"

        });

    }


};
