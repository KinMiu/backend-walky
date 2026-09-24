import "dotenv/config";
import {defineConfig} from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "node prisma/seed.js",
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL || process.env.DATABASE_URL_DEV || process.env.DATABASE_URL_PROD,
  },
});
