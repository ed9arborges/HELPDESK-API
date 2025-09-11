import { UserRole } from "@prisma/client"
import { Request, Response } from "express"
import { z } from "zod"
import prisma from "@/database/prisma"
import { AppError } from "@/utils/AppError"
import { hash } from "bcrypt"

class UsersController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(2, "Name is Mandatory").max(100),
      email: z
        .string()
        .trim()
        .email({ message: "Invalid email" })
        .toLowerCase(),
      password: z
        .string()
        .min(6, "Password is Mandatory at least 6 characters")
        .max(100),
      role: z
        .enum([UserRole.customer, UserRole.tech, UserRole.admin])
        .default(UserRole.customer),
    })

    const { name, email, password, role } = bodySchema.parse(request.body)

    const userWithSameEmail = await prisma.user.findFirst({
      where: { email },
    })

    if (userWithSameEmail) {
      throw new AppError("Email already in use", 409)
    }

    const hashedPassword = await hash(password, 8)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatarImg: "",
        role,
      },
    })

    response.status(201).json({ name, email, hashedPassword, role })
  }

  async updateMe(request: Request, response: Response) {
    if (!request.user) {
      throw new AppError("Unauthorized", 401)
    }

    const bodySchema = z.object({
      name: z.string().trim().min(2).max(100).optional(),
      email: z.string().trim().email().toLowerCase().optional(),
      password: z.string().min(6).max(100).optional(),
    })

    const { name, email, password } = bodySchema.parse(request.body)

    // Ensure user exists
    const current = await prisma.user.findUnique({
      where: { id: request.user.id },
    })
    if (!current) {
      throw new AppError("User not found", 404)
    }

    // If email is changing, ensure uniqueness
    if (email && email !== current.email) {
      const exists = await prisma.user.findFirst({ where: { email } })
      if (exists) {
        throw new AppError("Email already in use", 409)
      }
    }

    const data: { name?: string; email?: string; password?: string } = {}
    if (typeof name === "string") data.name = name
    if (typeof email === "string") data.email = email
    if (typeof password === "string" && password.length > 0) {
      data.password = await hash(password, 8)
    }

    const updated = await prisma.user.update({
      where: { id: request.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarImg: true,
      },
    })

    return response.json({ user: updated })
  }
}

export { UsersController }
