import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './posts.schema';
import { Model } from 'mongoose';
import { CreatePostDto } from 'src/ dtos/create-post.dto';
import { UpdatePostDto } from 'src/ dtos/update-post.dto';
import { User } from 'src/users/users.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  // [01] create post by specific user => userid from auth
  async create(userId: string, createPostDto: CreatePostDto) {
    const postObj = await this.postModel.create({
      content: createPostDto.content,
      author: userId,
    });
    return await postObj.save();
  }
  // [02] delete post
  async delete(userId: string, postId: string) {
    try {
      const post = await this.postModel.findById(postId);
      if (!post)
        throw new NotFoundException(`post with this [${postId}] id not exist`);
      if (post.author.toString() !== userId)
        throw new UnauthorizedException(
          'you are not allowed to delete this post',
        );
      const result = await this.postModel.findOneAndDelete({
        _id: postId,
        author: userId,
      });
      return result;
    } catch (error) {
      if ((error.name === 'CastError', error.kind === 'ObjectId')) {
        throw new BadRequestException('invalid id');
      }
    }
  }
  // [03] update post
  async update(userId: string, postId: string, updatePostDto: UpdatePostDto) {
    try {
      const post = await this.postModel.findById(postId);

      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }

      if (post.author.toString() !== userId) {
        throw new UnauthorizedException(
          'You are not allowed to update this post',
        );
      }
      if (updatePostDto.content !== undefined) {
        post.content = updatePostDto.content;
      }
      return await post.save();
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid post ID format');
      }
      throw error;
    }
  }

  // [04] list all posts => TODO pagination
  async getAllPosts() {
    return await this.postModel
      .find()
      .populate('author', '_id email role username');
  }

  // [05] get specific user posts
  async getUserPosts(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user)
      throw new UnauthorizedException('you are not allowed to list posts');
    return await this.postModel.find({ author: userId });
  }
  // [06] get specific post by id
  async getPostById(postId: string) {
    try {
      const post = await this.postModel.findById(postId);
      if (!post)
        throw new NotFoundException(`post with this [${postId}] id not found`);
      return post;
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid post ID format');
      }
      throw error;
    }
  }
}
