import { Post } from "./entities/Post";
import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

//console.log("dirname: ", __dirname )
export default {
    migrations: {
        path: path.join(__dirname, "./migrations"), // path to the folder with migrations
        pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
    },
    entities: [Post, User],
    dbName: "fullstackdb",
    password: "miso123",
    debug: !__prod__,
    type: "postgresql"
} as Parameters<typeof MikroORM.init>[0];