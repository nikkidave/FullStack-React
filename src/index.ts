import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
//import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';


const main = async () => {
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();
    const app = express();
    const RedisStore = connectRedis(session)
    const redisClient = redis.createClient()

    app.use(
        session({
            name: 'quid',//cookie name
            store: new RedisStore({
                client: redisClient,
                disableTouch: true
            }), //telling express that we are using redis
            saveUninitialized: false,
            secret: 'dsfsfsfwetew',
            resave: false,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10years
                httpOnly: true, //injavascript u cannot access the cookies
                sameSite: 'lax', //google what it does csrf
                secure: __prod__ // //cookie works only in https
            }
        })
    )
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ em: orm.em, req, res }) //Context is an object accessible by all your resolvers
    })
    apolloServer.applyMiddleware({ app }); //create graphql endpoint
    // app.get('/', (_, res) => {
    //     res.send("hello");
    // })
    app.listen(4000, () => {
        console.log('server started at 4000');
    })
    //  const post = orm.em.create(Post, {title: 'my first post'});
    //  await orm.em.persistAndFlush(post );
    //  const posts = await orm.em.find(Post, {});
    //  console.log(posts );
}
main().catch((err) => {
    console.error(err);
});