import { Request, Response } from "express";

import prisma from "../../config/database";


const isUniqueError = (error: unknown) =>
    (error as { code?: string })?.code === "P2002";


// ADD FAVORITE

export const addFavorite = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const restaurantId =
            Number(req.body?.restaurantId);


        if (!Number.isInteger(restaurantId)) {

            res.status(400).json({

                message: "restaurantId is required"

            });

            return;

        }


        const restaurant =
            await prisma.restaurant.findUnique({

                where: {
                    id: restaurantId
                }

            });


        if (!restaurant || !restaurant.isActive) {

            res.status(404).json({

                message: "Restaurant not found"

            });

            return;

        }


        const favorite =
            await prisma.favorite.create({

                data: {

                    userId: req.user!.id,

                    restaurantId

                },

                include: {
                    restaurant: true
                }

            });


        res.status(201).json({

            message: "Added to favorites",

            favorite

        });


    }


    catch (error) {

        // The guide returned 500 "Already favorite" for every
        // error, hiding real failures behind a wrong message.

        if (isUniqueError(error)) {

            res.status(400).json({

                message: "Already in favorites"

            });

            return;

        }


        console.error("Add favorite failed", error);

        res.status(500).json({

            message: "Add favorite failed"

        });

    }


};


// GET MY FAVORITES

export const getFavorites = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const favorites =
            await prisma.favorite.findMany({

                where: {
                    userId: req.user!.id
                },

                include: {

                    restaurant: {

                        include: {
                            category: true
                        }

                    }

                }

            });


        res.json({

            favorites

        });


    }

    catch (error) {

        console.error("Fetching favorites failed", error);

        res.status(500).json({

            message: "Fetching favorites failed"

        });

    }


};


// REMOVE FAVORITE

export const removeFavorite = async (
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


        const result =
            await prisma.favorite.deleteMany({

                where: {

                    userId: req.user!.id,

                    restaurantId

                }

            });


        if (result.count === 0) {

            res.status(404).json({

                message: "Favorite not found"

            });

            return;

        }


        res.json({

            message: "Removed from favorites"

        });


    }

    catch (error) {

        console.error("Remove favorite failed", error);

        res.status(500).json({

            message: "Remove favorite failed"

        });

    }


};
