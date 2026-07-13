import { Request, Response } from "express";

import prisma from "../../config/database";


const isNotFoundError = (error: unknown) =>
    (error as { code?: string })?.code === "P2025";


const isUniqueError = (error: unknown) =>
    (error as { code?: string })?.code === "P2002";


// CREATE CATEGORY

export const createCategory = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {


        const { name } = req.body ?? {};


        if (!name) {

            res.status(400).json({

                message: "name is required"

            });

            return;

        }


        const category =
            await prisma.category.create({

                data: {
                    name
                }

            });


        res.status(201).json({

            message: "Category created",

            category

        });


    }

    catch (error) {

        if (isUniqueError(error)) {

            res.status(400).json({

                message: "Category already exists"

            });

            return;

        }


        console.error("Create category failed", error);

        res.status(500).json({

            message: "Create category failed"

        });

    }

};


// GET ALL CATEGORIES

export const getCategories = async (
    _req: Request,
    res: Response
): Promise<void> => {

    try {


        const categories =
            await prisma.category.findMany({

                orderBy: {
                    name: "asc"
                },

                include: {

                    _count: {

                        select: {
                            restaurants: true
                        }

                    }

                }

            });


        res.json({

            categories

        });


    }

    catch (error) {

        console.error("Fetching categories failed", error);

        res.status(500).json({

            message: "Fetching categories failed"

        });

    }

};


// GET SINGLE CATEGORY

export const getCategoryById = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {


        const id = Number(req.params.id);


        if (!Number.isInteger(id)) {

            res.status(400).json({

                message: "Invalid category id"

            });

            return;

        }


        const category =
            await prisma.category.findUnique({

                where: {
                    id
                },

                include: {
                    restaurants: true
                }

            });


        if (!category) {

            res.status(404).json({

                message: "Category not found"

            });

            return;

        }


        res.json({

            category

        });


    }

    catch (error) {

        console.error("Error fetching category", error);

        res.status(500).json({

            message: "Error fetching category"

        });

    }

};


// UPDATE CATEGORY

export const updateCategory = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {


        const id = Number(req.params.id);


        const { name } = req.body ?? {};


        if (!Number.isInteger(id)) {

            res.status(400).json({

                message: "Invalid category id"

            });

            return;

        }


        if (!name) {

            res.status(400).json({

                message: "name is required"

            });

            return;

        }


        const category =
            await prisma.category.update({

                where: {
                    id
                },

                data: {
                    name
                }

            });


        res.json({

            message: "Category updated",

            category

        });


    }

    catch (error) {

        if (isNotFoundError(error)) {

            res.status(404).json({

                message: "Category not found"

            });

            return;

        }


        if (isUniqueError(error)) {

            res.status(400).json({

                message: "Category already exists"

            });

            return;

        }


        console.error("Update category failed", error);

        res.status(500).json({

            message: "Update category failed"

        });

    }

};


// DELETE CATEGORY

export const deleteCategory = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {


        const id = Number(req.params.id);


        if (!Number.isInteger(id)) {

            res.status(400).json({

                message: "Invalid category id"

            });

            return;

        }


        const restaurantCount =
            await prisma.restaurant.count({

                where: {
                    categoryId: id
                }

            });


        if (restaurantCount > 0) {

            res.status(400).json({

                message:
                    "Category has restaurants and cannot be deleted"

            });

            return;

        }


        await prisma.category.delete({

            where: {
                id
            }

        });


        res.json({

            message: "Category deleted"

        });


    }

    catch (error) {

        if (isNotFoundError(error)) {

            res.status(404).json({

                message: "Category not found"

            });

            return;

        }


        console.error("Delete category failed", error);

        res.status(500).json({

            message: "Delete category failed"

        });

    }

};
