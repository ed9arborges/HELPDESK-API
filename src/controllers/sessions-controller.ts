import prisma from "@/database/prisma"
import { AppError } from "@/utils/AppError"
import { compare } from "bcrypt"
import { Request, Response } from "express"
import { z } from "zod"
import { authConfig } from "@/configs/auth"
import { sign, SignOptions } from "jsonwebtoken"

class SessionsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      email: z.string().email({ message: "Invalid email" }),
      password: z.string().min(6).max(100),
    })

    const { email, password } = bodySchema.parse(request.body)

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    })

    if (!user) {
      throw new AppError("Email or password incorrect", 401)
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      throw new AppError("Email or password incorrect", 401)
    }

    const { secret, expiresIn } = authConfig.jwt

    const token = sign({ role: user.role }, secret, {
      subject: user.id,
      expiresIn: expiresIn as SignOptions["expiresIn"],
    })

    return response
      .status(200)
      .json({
        token,
        user: { name: user.name, email: user.email, role: user.role },
      })
  }
}

export { SessionsController }
