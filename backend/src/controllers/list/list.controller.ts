import { Request, Response } from "express";

import prisma from "../../config/database";


const isUniqueError = (error: unknown) =>
    (error as { code?: string })?.code === "P2002";


// Loads a list only if it belongs to the caller.
// Without this check any logged-in user could write
// into another user's list by guessing the id.

const findOwnedList = async (
    listId: number,
    userId: number
) => {


    const list =
        await prisma.userList.findUnique({

            where: {
                id: listId
            }

        });


    if (!list || list.userId !== userId) {

        return null;

    }


    return list;

};


// CREATE LIST

export const createList = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const {
            name,
            description
        } = req.body ?? {};


        if (!name) {

            res.status(400).json({

                message: "name is required"

            });

            return;

        }


        const list =
            await prisma.userList.create({

                data: {

                    name,

                    description,

                    userId: req.user!.id

                }

            });


        res.status(201).json({

            message: "List created",

            list

        });


    }

    catch (error) {

        console.error("List creation failed", error);

        res.status(500).json({

            message: "List creation failed"

        });

    }


};


// ADD RESTAURANT TO LIST

export const addRestaurantToList = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const listId = Number(req.params.id);

        const restaurantId =
            Number(req.body?.restaurantId);


        if (!Number.isInteger(listId)) {

            res.status(400).json({

                message: "Invalid list id"

            });

            return;

        }


        if (!Number.isInteger(restaurantId)) {

            res.status(400).json({

                message: "restaurantId is required"

            });

            return;

        }


        const list =
            await findOwnedList(listId, req.user!.id);


        if (!list) {

            res.status(404).json({

                message: "List not found"

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


        const item =
            await prisma.listRestaurant.create({

                data: {

                    listId,

                    restaurantId

                },

                include: {
                    restaurant: true
                }

            });


        res.status(201).json({

            message: "Restaurant added",

            item

        });


    }

    catch (error) {

        if (isUniqueError(error)) {

            res.status(400).json({

                message: "Restaurant already in this list"

            });

            return;

        }


        console.error("Adding restaurant to list failed", error);

        res.status(500).json({

            message: "Adding restaurant to list failed"

        });

    }


};


// REMOVE RESTAURANT FROM LIST

export const removeRestaurantFromList = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const listId = Number(req.params.id);

        const restaurantId =
            Number(req.params.restaurantId);


        if (
            !Number.isInteger(listId) ||
            !Number.isInteger(restaurantId)
        ) {

            res.status(400).json({

                message: "Invalid id"

            });

            return;

        }


        const list =
            await findOwnedList(listId, req.user!.id);


        if (!list) {

            res.status(404).json({

                message: "List not found"

            });

            return;

        }


        const result =
            await prisma.listRestaurant.deleteMany({

                where: {

                    listId,

                    restaurantId

                }

            });


        if (result.count === 0) {

            res.status(404).json({

                message: "Restaurant not in this list"

            });

            return;

        }


        res.json({

            message: "Restaurant removed from list"

        });


    }

    catch (error) {

        console.error("Removing restaurant from list failed", error);

        res.status(500).json({

            message: "Removing restaurant from list failed"

        });

    }


};


// GET MY LISTS

export const getMyLists = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const lists =
            await prisma.userList.findMany({

                where: {
                    userId: req.user!.id
                },

                include: {

                    restaurants: {

                        include: {

                            restaurant: {

                                include: {
                                    category: true
                                }

                            }

                        }

                    }

                },

                orderBy: {
                    createdAt: "desc"
                }

            });


        res.json({

            lists

        });


    }

    catch (error) {

        console.error("Fetching lists failed", error);

        res.status(500).json({

            message: "Fetching lists failed"

        });

    }


};


// DELETE LIST

export const deleteList = async (
    req: Request,
    res: Response
): Promise<void> => {


    try {


        const listId = Number(req.params.id);


        if (!Number.isInteger(listId)) {

            res.status(400).json({

                message: "Invalid list id"

            });

            return;

        }


        const list =
            await findOwnedList(listId, req.user!.id);


        if (!list) {

            res.status(404).json({

                message: "List not found"

            });

            return;

        }


        // ListRestaurant rows cascade on delete (see schema).

        await prisma.userList.delete({

            where: {
                id: listId
            }

        });


        res.json({

            message: "List deleted"

        });


    }

    catch (error) {

        console.error("Delete list failed", error);

        res.status(500).json({

            message: "Delete list failed"

        });

    }


};
