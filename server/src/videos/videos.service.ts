import {Injectable, NotFoundException, ServiceUnavailableException, StreamableFile} from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Video, VideoDocument } from './entities/video.entity';
import { Model } from 'mongoose';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';
import e, { Request, Response } from 'express';

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
  ) {}

  async create(video: Object) {
    const newVideo = new this.videoModel(video);
    return newVideo.save();
  }

  async findAll(id?: string) {
    if (id) {
      return this.videoModel.findOne({_id: id}).populate("createdBy").exec();
    }
    return this.videoModel.find().populate("createdBy").exec();
  }

  async findOne(id: string, request: Request, response: Response) {
    try {
      const data = await this.videoModel.findOne({ _id: id })
      if (!data) {
        throw new NotFoundException(null, 'VideoNotFound')
      }
      const { range } = request.headers;
      if (range) {
        const { video } = data;
        const videoPath = statSync(join(process.cwd(), `./public/${video}`))
        const CHUNK_SIZE = 1 * 1e6;
        const start = Number(range.replace(/\D/g, ''));
        const end = Math.min(start + CHUNK_SIZE, videoPath.size - 1);
        const videoLength = end - start + 1;
        // response.status(206)
        response.set({
          'Content-Range': `bytes ${start}-${end}/${videoPath.size}`,
          'Accept-Ranges': 'bytes',
          'Content-length': videoLength,
          'Content-Type': 'video/mp4',
        })
        const vidoeStream = createReadStream(join(process.cwd(), `./public/${video}`), { start, end });
        return new StreamableFile(vidoeStream);
      } else {
        throw new NotFoundException(null, 'range not found')
      }

    } catch (e) {
      console.error(e)
      throw new ServiceUnavailableException()
    }
  }

  async update(id: string, video: Object) {
    return this.videoModel.findByIdAndUpdate(id, video, { new: true })
  }

  async remove(id: string) {
    return this.videoModel.findByIdAndRemove(id);
  }
}
