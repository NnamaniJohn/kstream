import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './entities/video.entity';
import {MulterModule} from "@nestjs/platform-express";
import {diskStorage} from "multer";
import {v4 as uuidv4} from "uuid";
import {UsersModule} from "../users/users.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    MulterModule.register({
      storage: diskStorage({
        destination: './public',
        filename: (req, file, cb) => {
          const ext = file.mimetype.split('/')[1];
          cb(null, `${uuidv4()}-${Date.now()}.${ext}`);
        },
      })
    }),
      UsersModule
  ],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
