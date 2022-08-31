import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
@Entity()
export class Post {
  @Field(() => Int)
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: Date })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: Date, onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field(() => String) //@field exposses the field
  @Property({ type: "text" })
  title!: string;
}
