import { Comment } from "./comment.model";
import { User } from "./user.model";

export interface Post {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
  authorId: number;
  Comment: Comment[];
  author: User;
}