import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): MongooseModuleOptions => {
        const uri = config.getOrThrow<string>('MONGO_URI');

        return {
          uri: uri,
          dbName: config.getOrThrow<string>('MONGO_INITDB_ROOT_DATABASE'),
        };
      },
    }),
    UsersModule,
    PostsModule,
    AuthModule,
  ],
})
export class AppModule {}
