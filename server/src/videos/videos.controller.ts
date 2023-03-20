import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete, UseGuards, Request, Req, Res, UseInterceptors, UploadedFile, UploadedFiles, Query, StreamableFile
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import {JwtAuthGuard} from "../auth/guard/jwt-auth.guard";
import {FileFieldsInterceptor, FileInterceptor} from "@nestjs/platform-express";
import {UsersService} from "../users/users.service";

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService, private userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'video', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]))
  async create(@Request() req, @UploadedFiles() files: { video?: Express.Multer.File[], cover?: Express.Multer.File[] }, @Body() createVideoDto: CreateVideoDto) {
    const user = await this.userService.findOne(req.user.email);
    const reqBody = { createdBy: user, title: createVideoDto.title, video: files.video[0].filename, coverImage: files.cover[0].filename}
    return await this.videosService.create(reqBody);
  }

  @Get()
  async findAll(@Query('id') id: string) {
    return await this.videosService.findAll(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req, @Res({ passthrough: true }) res ) {
    return await this.videosService.findOne(id, req, res);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    return await this.videosService.update(id, updateVideoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.videosService.remove(id);
  }
}
