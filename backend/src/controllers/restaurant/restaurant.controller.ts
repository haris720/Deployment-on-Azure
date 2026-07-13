import { Request, Response } from "express";

import path from "path";

import fs from "fs";

import prisma from "../../config/database";

import { UPLOAD_DIR } from "../../middleware/upload.middleware";


// Only these fields may be set from the request body.
// Passing req.body straight to Prisma would let a client
// set id / isActive / createdAt, or 500 on an unknown key.

const pickRestaurantFields = (body: any) => {

    const {

        name,

        description,

        address,

        city,

        phone,

        email,

        website,

        openingTime,

        closingTime,

        latitude,

        longitude,

        categoryId

    } = body ?? {};


    const data: Record<string, unknown> = {

        name,

        description,

        address,

        city,

        phone,

        email,

        website,

        openingTime,

        closingTime,

        latitude:
            latitude === undefined
                ? undefined
                : Number(latitude),

        longitude:
            longitude === undefined
                ? undefined
                : Number(longitude),

        categoryId:
            categoryId === undefined
                ? undefined
                : Number(categoryId)

    };


    Object.keys(data).forEach((key) => {

        if (data[key] === undefined) {

            delete data[key];

        }

    });


    return data;

};


const isNotFoundError = (error: unknown) =>
    (error as { code?: string })?.code === "P2025";


// CREATE RESTAURANT

export const createRestaurant = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {


        const data = pickRestaurantFields(req.body);


        if (
            !data.name ||
            !data.address ||
            !data.city ||
            data.categoryId === undefined
        ) {

            res.status(400).json({

                message:
                    "name, address, city and categoryId are required"

            });

            return;

        }


        const category =
            await prisma.category.findUnique({

                where: {
                    id: Number(data.categoryId)
                }

            });


        if (!category) {

            res.status(400).json({

                message: "Category not found"

            });

            return;

        }


        const restaurant =
            await prisma.restaurant.create({

                data: data as any,

                include: {
                    category: true
                }

            });


        res.status(201).json({

            message: "Restaurant created",

            restaurant

        });


    }

    catch (error) {

        console.error("Create restaurant failed", error);

        res.status(500).json({

            message: "Create restaurant failed"

        });

    }

};


// GET ALL RESTAURANTS
// Supports ?search= &city= &categoryId= &page= &limit=

export const getRestaurants = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {


        const {

            search,

            city,

            categoryId,

            page = "1",

            limit = "10"

        } = req.query;


        const currentPage =
            Math.max(Number(page) || 1, 1);


        const perPage =
            Math.min(
                Math.max(Number(limit) || 10, 1),
                100
            );


        const where = {

            isActive: true,


            city: city
                ? {
                    equals: String(city),
                    mode: "insensitive" as const
                }
                : undefined,


            categoryId: categoryId
                ? Number(categoryId)
                : undefined,


            OR: search
                ? [
                    {
                        name: {
                            contains: String(search),
                            mode: "insensitive" as const
                        }
                    },
                    {
                        description: {
                            contains: String(search),
                            mode: "insensitive" as const
                        }
                    }
                ]
                : undefined

        };


        const [restaurants, total] =
            await Promise.all([

                prisma.restaurant.findMany({

                    where,

                    include: {
                        category: true
                    },

                    orderBy: {
                        createdAt: "desc"
                    },

                    skip: (currentPage - 1) * perPage,

                    take: perPage

                }),


                prisma.restaurant.count({ where })

            ]);


        res.json({

            restaurants,

            pagination: {

                total,

                page: currentPage,

                limit: perPage,

                pages: Math.ceil(total / perPage)

            }

        });


    }

    catch (error) {

        console.error("Fetching restaurants failed", error);

        res.status(500).json({

            message: "Fetching restaurants failed"

        });

    }

};


// GET SINGLE RESTAURANT

export const getRestaurantById = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {


        const id = Number(req.params.id);


        if (!Number.isInteger(id)) {

            res.status(400).json({

                message: "Invalid restaurant id"

            });

            return;

        }


        const restaurant =
            await prisma.restaurant.findUnique({

                where: {
                    id
                },

                include: {

                    category: true,

                    images: true,

                    reviews: {

                        include: {

                            user: {

                                select: {

                                    id: true,

                                    name: true

                                }

                            }

                        }

                    }

                }

            });


        if (!restaurant) {

            res.status(404).json({

                message: "Restaurant not found"

            });

            return;

        }


        const average =
            restaurant.reviews.length === 0
                ? null
                : Number(
                    (
                        restaurant.reviews.reduce(
                            (sum, review) =>
                                sum + review.rating,
                            0
                        ) / restaurant.reviews.length
                    ).toFixed(2)
                );


        res.json({

            rating: {

                average,

                count: restaurant.reviews.length

            },

            restaurant

        });


    }

    catch (error) {

        console.error("Error fetching restaurant", error);

        res.status(500).json({

            message: "Error fetching restaurant"

        });

    }

};


// UPDATE RESTAURANT

export const updateRestaurant = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {


        const id = Number(req.params.id);


        if (!Number.isInteger(id)) {

            res.status(400).json({

                message: "Invalid restaurant id"

            });

            return;

        }


        const data = pickRestaurantFields(req.body);


        const restaurant =
            await prisma.restaurant.update({

                where: {
                    id
                },

                data: data as any,

                include: {
                    category: true
                }

            });


        res.json({

            message: "Restaurant updated",

            restaurant

        });


    }

    catch (error) {

        if (isNotFoundError(error)) {

            res.status(404).json({

                message: "Restaurant not found"

            });

            return;

        }


        console.error("Update failed", error);

        res.status(500).json({

            message: "Update failed"

        });

    }

};


// DELETE RESTAURANT (soft delete)

export const deleteRestaurant = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {


        const id = Number(req.params.id);


        if (!Number.isInteger(id)) {

            res.status(400).json({

                message: "Invalid restaurant id"

            });

            return;

        }


        await prisma.restaurant.update({

            where: {
                id
            },

            data: {

                isActive: false

            }

        });


        res.json({

            message: "Restaurant deleted"

        });


    }

    catch (error) {

        if (isNotFoundError(error)) {

            res.status(404).json({

                message: "Restaurant not found"

            });

            return;

        }


        console.error("Delete failed", error);

        res.status(500).json({

            message: "Delete failed"

        });

    }

};


// UPLOAD RESTAURANT IMAGES (admin)
// Files arrive via the multer `upload.array("images")` middleware.

export const uploadRestaurantImages = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {


        const id = Number(req.params.id);


        if (!Number.isInteger(id)) {

            res.status(400).json({

                message: "Invalid restaurant id"

            });

            return;

        }


        const files = req.files as
            | Express.Multer.File[]
            | undefined;


        if (!files || files.length === 0) {

            res.status(400).json({

                message: "At least one image file is required"

            });

            return;

        }


        const restaurant =
            await prisma.restaurant.findUnique({

                where: {
                    id
                }

            });


        if (!restaurant) {

            res.status(404).json({

                message: "Restaurant not found"

            });

            return;

        }


        const images = await prisma.$transaction(

            files.map((file) =>

                prisma.restaurantImage.create({

                    data: {

                        url: `/uploads/${file.filename}`,

                        restaurantId: id

                    }

                })

            )

        );


        res.status(201).json({

            message: "Images uploaded",

            images

        });


    }

    catch (error) {

        console.error("Image upload failed", error);

        res.status(500).json({

            message: "Image upload failed"

        });

    }

};


// DELETE RESTAURANT IMAGE (admin)

export const deleteRestaurantImage = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {


        const imageId = Number(req.params.imageId);


        if (!Number.isInteger(imageId)) {

            res.status(400).json({

                message: "Invalid image id"

            });

            return;

        }


        const image =
            await prisma.restaurantImage.findUnique({

                where: {
                    id: imageId
                }

            });


        if (!image) {

            res.status(404).json({

                message: "Image not found"

            });

            return;

        }


        await prisma.restaurantImage.delete({

            where: {
                id: imageId
            }

        });


        // Remove the file too, or deleted images pile up on disk.

        const filePath = path.join(
            UPLOAD_DIR,
            path.basename(image.url)
        );


        fs.promises
            .unlink(filePath)
            .catch(() => undefined);


        res.json({

            message: "Image deleted"

        });


    }

    catch (error) {

        console.error("Image delete failed", error);

        res.status(500).json({

            message: "Image delete failed"

        });

    }

};
