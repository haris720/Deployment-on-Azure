import dotenv from "dotenv";

// Tests import ../src/app directly, which never runs server.ts,
// so nothing else loads the environment for them.

dotenv.config();
