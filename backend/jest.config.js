/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {

    preset: "ts-jest",

    testEnvironment: "node",

    roots: ["<rootDir>/tests"],

    testMatch: ["**/*.test.ts"],

    setupFiles: ["<rootDir>/tests/setup.ts"],

    // Prisma's pool keeps the event loop alive for a moment after
    // the last test; without this Jest warns about open handles.
    forceExit: true,

    testTimeout: 20000

};
