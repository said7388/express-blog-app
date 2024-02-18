import { Post } from "./post.model";
import { User } from "./user.model";

export interface Comment {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  authorId: number;
  postId: number;
  author: User;
  post: Post;
}