import request from "supertest";

import app from "../src/app";

import prisma from "../src/config/database";


// Unique per run so repeated runs don't collide on the email
// unique constraint.

const email = `test-${Date.now()}@example.com`;

const password = "SuperSecret123";


afterAll(async () => {

    await prisma.user.deleteMany({
        where: {
            email
        }
    });

    await prisma.$disconnect();

});


describe("Health", () => {

    it("reports that the API is running", async () => {

        const res = await request(app).get("/api/health");

        expect(res.status).toBe(200);

        expect(res.body.success).toBe(true);

    });


    it("returns 404 as JSON for an unknown route", async () => {

        const res = await request(app).get("/api/nope");

        expect(res.status).toBe(404);

        expect(res.body.success).toBe(false);

    });

});


describe("Registration validation", () => {

    it("rejects a short password", async () => {

        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Tester",
                email: `short-${Date.now()}@example.com`,
                password: "123"
            });

        expect(res.status).toBe(400);

        expect(res.body.message).toBe("Validation error");

        expect(res.body.errors[0].field).toBe("password");

    });


    it("rejects a malformed email", async () => {

        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Tester",
                email: "not-an-email",
                password: "SuperSecret123"
            });

        expect(res.status).toBe(400);

        expect(res.body.errors[0].field).toBe("email");

    });

});


describe("Register and login", () => {

    it("registers a user and returns a token", async () => {

        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Tester",
                email,
                password
            });

        expect(res.status).toBe(201);

        expect(res.body.token).toBeDefined();

        expect(res.body.user.role).toBe("USER");

        // The hash must never leave the server.
        expect(res.body.user.password).toBeUndefined();

    });


    it("rejects a duplicate email", async () => {

        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Tester",
                email,
                password
            });

        expect(res.status).toBe(400);

    });


    it("logs in with the right password", async () => {

        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password
            });

        expect(res.status).toBe(200);

        expect(res.body.token).toBeDefined();

    });


    it("rejects the wrong password", async () => {

        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password: "WrongPassword123"
            });

        expect(res.status).toBe(401);

    });

});


describe("Protected routes", () => {

    it("requires a token", async () => {

        const res = await request(app).get("/api/auth/profile");

        expect(res.status).toBe(401);

    });


    it("rejects a forged token", async () => {

        const res = await request(app)
            .get("/api/auth/profile")
            .set("Authorization", "Bearer not.a.real.token");

        expect(res.status).toBe(401);

    });


    it("returns the profile with a valid token", async () => {

        const login = await request(app)
            .post("/api/auth/login")
            .send({ email, password });


        const res = await request(app)
            .get("/api/auth/profile")
            .set(
                "Authorization",
                `Bearer ${login.body.token}`
            );

        expect(res.status).toBe(200);

        expect(res.body.user.email).toBe(email);

    });


    it("blocks a normal user from the admin panel", async () => {

        const login = await request(app)
            .post("/api/auth/login")
            .send({ email, password });


        const res = await request(app)
            .get("/api/admin/dashboard")
            .set(
                "Authorization",
                `Bearer ${login.body.token}`
            );

        expect(res.status).toBe(403);

    });

});
