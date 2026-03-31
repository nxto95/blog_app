import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreatePostDto } from 'src/ dtos/create-post.dto';
import { JwtAuthGuard } from 'src/auth/guards';
import { UpdatePostDto } from 'src/ dtos/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getAllPosts() {
    return await this.postsService.getAllPosts();
  }

  @Get('user-posts')
  @UseGuards(JwtAuthGuard)
  async getUserPosts(@CurrentUser() user: any) {
    const id = user.userid;
    return await this.postsService.getUserPosts(id);
  }

  @Get(':postId')
  async getPostById(@Param('postId') postId: string) {
    return await this.postsService.getPostById(postId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: any, @Body() createPostDto: CreatePostDto) {
    const id = user.userid;
    return this.postsService.create(id, createPostDto);
  }

  @Delete(':postId')
  @UseGuards(JwtAuthGuard)
  async delete(@CurrentUser() user: any, @Param('postId') postId: string) {
    const id = user.userid;
    return await this.postsService.delete(id, postId);
  }

  @Put(':postId')
  @UseGuards(JwtAuthGuard)
  async update(
    @CurrentUser() user: any,
    @Param('postId') postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const id = user.userid;
    return await this.postsService.update(id, postId, updatePostDto);
  }
}
