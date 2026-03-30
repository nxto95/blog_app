// src/users/users.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;
export enum Roles {
  ADMIN = 'admin',
  USER = 'user',
}

@Schema({
  timestamps: true,
  autoIndex: true,
})
export class User {
  @Prop({ required: true })
  email: string;

  @Prop({
    unique: true,
    required: true,
    minlength: 2,
    maxlength: 55,
  })
  username: string;

  @Prop({ type: String, enum: Roles, default: Roles.USER, required: true })
  role: Roles;

  @Prop({ minlength: 8, required: true, select: false })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
