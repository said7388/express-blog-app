import { Comment } from "./comment.model";
import { Post } from "./post.model";

export interface User {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  password: string;
  Comment: Comment[];
  Post: Post[];
};