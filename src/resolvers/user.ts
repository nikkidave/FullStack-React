import { Resolver, Ctx, Arg, Mutation, InputType, Field, ObjectType, Query } from "type-graphql";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import argon2 from "argon2";


@InputType()
class UsernamePasswordInput {
    @Field()
    username: string;
    @Field()
    password: string;
}

@ObjectType()
class FieldError {
    @Field()
    field: string
    @Field()
    message: string
}

@ObjectType() //returned from mutations
class userResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
    @Field(() => User, { nullable: true })
    user?: User;
}
@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req, em }: MyContext
    ) {
        if (!req.session.userId) {
            //you are not logged in
             return null;
        }
        const user = await em.findOne(User, { id: session!.userId });
        return user;
    }


    @Mutation(() => userResponse)
    async register(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
    ): Promise<userResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [{
                    field: 'username',
                    message: 'length should be greater than 2'
                }]
            }
        }
        if (options.password.length <= 3) {
            return {
                errors: [{
                    field: 'password',
                    message: 'length should be greater than 2'
                }]
            }
        }
        const hashedpasswords = await argon2.hash(options.password);
        const user = em.create(User, {
            username: options.username,
            password: hashedpasswords
        })
        try {
            await em.persistAndFlush(user);
        }
        catch (err) {
            if (err.code === '23505') {
                console.log(err)
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'username taken'
                        }
                    ]

                }
            }

        }

        return {
            user
        }
    }

    @Mutation(() => userResponse)
    async login(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { em, req, res }: MyContext
    ): Promise<userResponse> {
        const user = await em.findOne(User, { username: options.username });
        if (!user) {
            return {
                errors: [{
                    field: 'username',
                    message: "that user doesnt exist"
                }]
            }
        }
        const valid = await argon2.verify(user.password, options.password);
        if (!valid) {
            return {
                errors: [{
                    field: 'password',
                    message: "invalid login"
                }]
            }

        }
        req.session.userId = user.id; //Put "!" req.session.userId if it complaints that userId doesnt exist
        return {
            user

        };
    }

}