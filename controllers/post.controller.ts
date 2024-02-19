import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { User } from "../models/user.model";
import prisma from "../prisma";
import { queryTypes } from "../types";
import { createPostSchema, updatePostSchema } from "../validation-schema/post";

/**
 * ROUTE: /api/posts
 * METHOD: GET
 * DESC: Get all posts
 */
export const getAllPost = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search = '' } = req.query as queryTypes;
  const skip = (Number(page) - 1) * Number(limit);
  let whereCondition: Prisma.PostWhereInput = {};

  if (search) {
    whereCondition = {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ],
    };
  };

  try {
    const posts = await prisma.post.findMany({
      where: whereCondition,
      skip: skip,
      take: Number(limit),
    });

    const totalPosts = await prisma.post.count({ where: whereCondition });

    return res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / Number(limit)),
        totalItems: totalPosts,
      },
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong! Please try again.',
    });
  }
};

/**
 * ROUTE: /api/posts/:id
 * METHOD: GET
 * DESC: Get a single post by id
 */
export const getSinglePost = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: true,
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found!"
      });
    };

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    // console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again."
    });
  }
};

/**
 * ROUTE: /api/posts/me
 * METHOD: GET
 * DESC: Get all posts for a user
 */
export const getUserAllPost = async (req: Request, res: Response) => {
  const user = req.user as User;
  const { page = 1, limit = 10, search = '' } = req.query as queryTypes;
  const skip = (Number(page) - 1) * Number(limit);

  let whereCondition: Prisma.PostWhereInput = {
    authorId: user.id,
  };

  if (search) {
    whereCondition = {
      AND: [
        { authorId: user.id },
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        },
      ],
    };
  };

  try {
    const posts = await prisma.post.findMany({
      where: whereCondition,
      skip: skip,
      take: Number(limit),
    });

    const totalPosts = await prisma.post.count({ where: whereCondition });

    return res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / Number(limit)),
        totalItems: totalPosts,
      },
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong! Please try again.',
    });
  }
};

/**
 * ROUTE: /api/posts/create
 * METHOD: POST
 * DESC: Create a new post
 */
export const createPost = async (req: Request, res: Response) => {
  const { title, content } = req.body;
  const user = req.user as User;
  const { error } = createPostSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    })
  };

  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: user.id,
      }
    });

    return res.status(201).json({
      success: true,
      data: post,
      message: "New post created successfully!"
    });
  } catch (error) {
    // console.log(error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again."
    });
  }
};

/**
 * ROUTE: /api/posts/update/:id
 * METHOD: PUT
 * DESC: Update post data by id
 */
export const updatePost = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { title, content } = req.body;
  const user = req.user as User;
  const { error } = updatePostSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    })
  };

  try {
    const findPost = await prisma.post.findUnique({ where: { id: id } });

    if (!findPost) {
      return res.status(404).json({
        success: false,
        message: "This post not found!"
      });
    } else if (findPost.authorId !== user.id) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to update this post!"
      });
    };

    const post = await prisma.post.update({
      where: { id: id },
      data: {
        title: title || findPost.title,
        content: content || findPost.content,
      }
    });

    return res.status(200).json({
      success: true,
      data: post,
      message: "Post updated successfully!"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again."
    });
  }
};

/**
 * ROUTE: /api/posts/delete/:id
 * METHOD: DELETE
 * DESC: Delete a post data by id
 */
export const deletePost = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const user = req.user as User;

  try {
    const findPost = await prisma.post.findUnique({ where: { id: id } });

    if (!findPost) {
      return res.status(404).json({
        success: false,
        message: "This post was not found!"
      });
    } else if (findPost.authorId !== user.id) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to delete this post!"
      });
    };

    await prisma.post.delete({ where: { id: id } });

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully!"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again."
    });
  }
};