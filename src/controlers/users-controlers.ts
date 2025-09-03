import { UserRole } from "@prisma/client"
import { Request, Response } from "express"
import { z } from "zod"
import prisma from "@/database/prisma"
import { AppError } from "@/utils/AppError"
import {hash} from "bcrypt"

class UsersController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(2, "Name is Mandatory").max(100),
      email: z
        .string()
        .trim()
        .email({ message: "Invalid email" })
        .toLowerCase(),
      password: z.string().min(6, "Password is Mandatory at least 6 characters").max(100),
      role: z
        .enum([UserRole.customer, UserRole.tech, UserRole.admin])
        .default(UserRole.customer),
    })

    const { name, email, password, role } = bodySchema.parse(request.body)

    const userWithSameEmail = await prisma.user.findFirst({
      where: { email }
    })

    if (userWithSameEmail) {
      throw new AppError("Email already in use", 409)
    }

    const hashedPassword = (await hash(password, 8))

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        filename: "",
        role
      }
    })

    response.status(201).json({ name, email, hashedPassword, role })
  }
}

export { UsersController }
