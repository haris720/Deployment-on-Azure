import request from "supertest";

import app from "../src/app";

import prisma from "../src/config/database";


afterAll(async () => {

    await prisma.$disconnect();

});


describe("Public restaurant browsing", () => {

    it("lists restaurants with pagination metadata", async () => {

        const res = await request(app).get("/api/restaurants");

        expect(res.status).toBe(200);

        expect(Array.isArray(res.body.restaurants)).toBe(true);

        expect(res.body.pagination).toHaveProperty("total");

        expect(res.body.pagination).toHaveProperty("pages");

    });


    it("caps an oversized limit at 100", async () => {

        const res = await request(app)
            .get("/api/restaurants?limit=99999");

        expect(res.status).toBe(200);

        expect(res.body.pagination.limit).toBe(100);

    });


    it("404s on an unknown restaurant", async () => {

        const res = await request(app)
            .get("/api/restaurants/99999999");

        expect(res.status).toBe(404);

    });


    it("lists categories", async () => {

        const res = await request(app).get("/api/categories");

        expect(res.status).toBe(200);

        expect(Array.isArray(res.body.categories)).toBe(true);

    });

});


describe("Restaurant writes are admin-only", () => {

    it("rejects an anonymous create", async () => {

        const res = await request(app)
            .post("/api/restaurants")
            .send({
                name: "Hack Cafe",
                address: "x",
                city: "y",
                categoryId: 1
            });

        expect(res.status).toBe(401);

    });


    it("rejects an anonymous delete", async () => {

        const res = await request(app)
            .delete("/api/restaurants/1");

        expect(res.status).toBe(401);

    });

});


describe("Reviews never leak password hashes", () => {

    it("omits the password from the public reviews route", async () => {

        const res = await request(app)
            .get("/api/reviews/restaurant/1");

        expect(res.status).toBe(200);


        for (const review of res.body.reviews) {

            expect(review.user.password).toBeUndefined();

        }


        expect(res.body.rating).toHaveProperty("average");

    });

});
