// The spec is written out here rather than scanned from JSDoc
// comments with swagger-jsdoc. A glob like ["./src/routes/*.ts"]
// resolves to nothing in production (only dist/**/*.js is shipped),
// so the docs page would render empty on the server.

const bearerAuth = [{ bearerAuth: [] }];


const json = (schema: object) => ({

    content: {

        "application/json": {

            schema

        }

    }

});


export const swaggerSpec = {

    openapi: "3.0.0",


    info: {

        title: "My Treats API",

        version: "1.0.0",

        description:
            "Restaurant discovery platform: auth, restaurants, reviews, favorites, lists, reservations and admin."

    },


    servers: [

        {
            url: "/api",
            description: "API root"
        }

    ],


    components: {

        securitySchemes: {

            bearerAuth: {

                type: "http",

                scheme: "bearer",

                bearerFormat: "JWT"

            }

        }

    },


    tags: [

        { name: "Auth" },

        { name: "Restaurants" },

        { name: "Categories" },

        { name: "Reviews" },

        { name: "Favorites" },

        { name: "Lists" },

        { name: "Reservations" },

        { name: "Admin" }

    ],


    paths: {

        "/health": {

            get: {

                tags: ["Auth"],

                summary: "Service health check",

                responses: {
                    "200": { description: "API is running" }
                }

            }

        },


        "/auth/register": {

            post: {

                tags: ["Auth"],

                summary: "Register a new user",

                requestBody: json({

                    type: "object",

                    required: ["name", "email", "password"],

                    properties: {

                        name: { type: "string", minLength: 3 },

                        email: { type: "string", format: "email" },

                        password: { type: "string", minLength: 8 }

                    }

                }),

                responses: {

                    "201": { description: "User registered, returns JWT" },

                    "400": { description: "Validation error or email taken" }

                }

            }

        },


        "/auth/login": {

            post: {

                tags: ["Auth"],

                summary: "Log in and receive a JWT",

                requestBody: json({

                    type: "object",

                    required: ["email", "password"],

                    properties: {

                        email: { type: "string", format: "email" },

                        password: { type: "string" }

                    }

                }),

                responses: {

                    "200": { description: "Login successful" },

                    "401": { description: "Invalid email or password" }

                }

            }

        },


        "/auth/profile": {

            get: {

                tags: ["Auth"],

                summary: "Current user profile",

                security: bearerAuth,

                responses: {

                    "200": { description: "The logged-in user" },

                    "401": { description: "Authentication required" }

                }

            }

        },


        "/restaurants": {

            get: {

                tags: ["Restaurants"],

                summary: "List restaurants (search, filter, paginate)",

                parameters: [

                    { name: "search", in: "query", schema: { type: "string" } },

                    { name: "city", in: "query", schema: { type: "string" } },

                    { name: "categoryId", in: "query", schema: { type: "integer" } },

                    { name: "page", in: "query", schema: { type: "integer", default: 1 } },

                    { name: "limit", in: "query", schema: { type: "integer", default: 10, maximum: 100 } }

                ],

                responses: {
                    "200": { description: "Paginated restaurants" }
                }

            },


            post: {

                tags: ["Restaurants"],

                summary: "Create a restaurant (admin)",

                security: bearerAuth,

                requestBody: json({

                    type: "object",

                    required: ["name", "address", "city", "categoryId"],

                    properties: {

                        name: { type: "string" },

                        description: { type: "string" },

                        address: { type: "string" },

                        city: { type: "string" },

                        phone: { type: "string" },

                        email: { type: "string", format: "email" },

                        website: { type: "string", format: "uri" },

                        openingTime: { type: "string" },

                        closingTime: { type: "string" },

                        latitude: { type: "number" },

                        longitude: { type: "number" },

                        categoryId: { type: "integer" }

                    }

                }),

                responses: {

                    "201": { description: "Restaurant created" },

                    "403": { description: "Admin access required" }

                }

            }

        },


        "/restaurants/{id}": {

            get: {

                tags: ["Restaurants"],

                summary: "Restaurant detail with rating, images and reviews",

                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],

                responses: {

                    "200": { description: "Restaurant" },

                    "404": { description: "Not found" }

                }

            },


            put: {

                tags: ["Restaurants"],

                summary: "Update a restaurant (admin)",

                security: bearerAuth,

                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],

                responses: {
                    "200": { description: "Restaurant updated" }
                }

            },


            delete: {

                tags: ["Restaurants"],

                summary: "Soft-delete a restaurant (admin)",

                security: bearerAuth,

                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],

                responses: {
                    "200": { description: "Restaurant deleted" }
                }

            }

        },


        "/restaurants/{id}/images": {

            post: {

                tags: ["Restaurants"],

                summary: "Upload up to 5 images (admin, max 5MB each)",

                security: bearerAuth,

                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],

                requestBody: {

                    content: {

                        "multipart/form-data": {

                            schema: {

                                type: "object",

                                properties: {

                                    images: {

                                        type: "array",

                                        items: {
                                            type: "string",
                                            format: "binary"
                                        }

                                    }

                                }

                            }

                        }

                    }

                },

                responses: {

                    "201": { description: "Images uploaded" },

                    "400": { description: "No file, wrong type, or too large" }

                }

            }

        },


        "/categories": {

            get: {

                tags: ["Categories"],

                summary: "List categories",

                responses: {
                    "200": { description: "Categories" }
                }

            },


            post: {

                tags: ["Categories"],

                summary: "Create a category (admin)",

                security: bearerAuth,

                requestBody: json({

                    type: "object",

                    required: ["name"],

                    properties: {
                        name: { type: "string" }
                    }

                }),

                responses: {
                    "201": { description: "Category created" }
                }

            }

        },


        "/reviews": {

            post: {

                tags: ["Reviews"],

                summary: "Review a restaurant (one per user per restaurant)",

                security: bearerAuth,

                requestBody: json({

                    type: "object",

                    required: ["restaurantId", "rating"],

                    properties: {

                        restaurantId: { type: "integer" },

                        rating: { type: "integer", minimum: 1, maximum: 5 },

                        comment: { type: "string" }

                    }

                }),

                responses: {

                    "201": { description: "Review added" },

                    "400": { description: "Invalid rating or already reviewed" }

                }

            }

        },


        "/reviews/restaurant/{restaurantId}": {

            get: {

                tags: ["Reviews"],

                summary: "Reviews and average rating for a restaurant",

                parameters: [
                    { name: "restaurantId", in: "path", required: true, schema: { type: "integer" } }
                ],

                responses: {
                    "200": { description: "Reviews with { average, count }" }
                }

            }

        },


        "/favorites": {

            get: {

                tags: ["Favorites"],

                summary: "My favorite restaurants",

                security: bearerAuth,

                responses: {
                    "200": { description: "Favorites" }
                }

            },


            post: {

                tags: ["Favorites"],

                summary: "Add a favorite",

                security: bearerAuth,

                requestBody: json({

                    type: "object",

                    required: ["restaurantId"],

                    properties: {
                        restaurantId: { type: "integer" }
                    }

                }),

                responses: {
                    "201": { description: "Added to favorites" }
                }

            }

        },


        "/lists": {

            get: {

                tags: ["Lists"],

                summary: "My personal lists",

                security: bearerAuth,

                responses: {
                    "200": { description: "Lists with their restaurants" }
                }

            },


            post: {

                tags: ["Lists"],

                summary: "Create a list",

                security: bearerAuth,

                requestBody: json({

                    type: "object",

                    required: ["name"],

                    properties: {

                        name: { type: "string" },

                        description: { type: "string" }

                    }

                }),

                responses: {
                    "201": { description: "List created" }
                }

            }

        },


        "/lists/{id}/restaurants": {

            post: {

                tags: ["Lists"],

                summary: "Add a restaurant to one of my lists",

                security: bearerAuth,

                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],

                requestBody: json({

                    type: "object",

                    required: ["restaurantId"],

                    properties: {
                        restaurantId: { type: "integer" }
                    }

                }),

                responses: {

                    "201": { description: "Restaurant added" },

                    "404": { description: "List not found (or not yours)" }

                }

            }

        },


        "/reservations": {

            post: {

                tags: ["Reservations"],

                summary: "Book a table",

                security: bearerAuth,

                requestBody: json({

                    type: "object",

                    required: ["restaurantId", "reservationDate", "people"],

                    properties: {

                        restaurantId: { type: "integer" },

                        reservationDate: { type: "string", format: "date-time" },

                        people: { type: "integer", minimum: 1, maximum: 50 },

                        specialRequest: { type: "string" }

                    }

                }),

                responses: {

                    "201": { description: "Reservation created (PENDING)" },

                    "400": { description: "Date must be valid and in the future" }

                }

            }

        },


        "/reservations/my": {

            get: {

                tags: ["Reservations"],

                summary: "My booking history",

                security: bearerAuth,

                responses: {
                    "200": { description: "Reservations" }
                }

            }

        },


        "/reservations/{id}/cancel": {

            put: {

                tags: ["Reservations"],

                summary: "Cancel my reservation (owner or admin)",

                security: bearerAuth,

                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],

                responses: {

                    "200": { description: "Reservation cancelled" },

                    "403": { description: "Not your reservation" }

                }

            }

        },


        "/reservations/{id}/status": {

            put: {

                tags: ["Reservations"],

                summary: "Set reservation status (admin)",

                security: bearerAuth,

                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],

                requestBody: json({

                    type: "object",

                    required: ["status"],

                    properties: {

                        status: {

                            type: "string",

                            enum: [
                                "PENDING",
                                "CONFIRMED",
                                "CANCELLED",
                                "COMPLETED"
                            ]

                        }

                    }

                }),

                responses: {
                    "200": { description: "Status updated" }
                }

            }

        },


        "/admin/dashboard": {

            get: {

                tags: ["Admin"],

                summary: "Platform statistics",

                security: bearerAuth,

                responses: {

                    "200": { description: "Counts" },

                    "403": { description: "Admin access required" }

                }

            }

        },


        "/admin/users": {

            get: {

                tags: ["Admin"],

                summary: "List all users",

                security: bearerAuth,

                responses: {
                    "200": { description: "Users" }
                }

            }

        },


        "/admin/users/{id}/role": {

            put: {

                tags: ["Admin"],

                summary: "Promote or demote a user",

                security: bearerAuth,

                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" } }
                ],

                requestBody: json({

                    type: "object",

                    required: ["role"],

                    properties: {

                        role: {
                            type: "string",
                            enum: ["USER", "ADMIN"]
                        }

                    }

                }),

                responses: {
                    "200": { description: "Role updated" }
                }

            }

        }

    }

};
