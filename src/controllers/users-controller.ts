import { UserRole } from "@prisma/client"
import { Request, Response } from "express"
import { z } from "zod"
import prisma from "@/database/prisma"
import path from "path"
import fs from "fs"
import { AppError } from "@/utils/AppError"
import { hash } from "bcrypt"

class UsersController {
  async index(request: Request, response: Response) {
    // Admin-only; middleware should ensure auth/role
    const querySchema = z.object({
      role: z.nativeEnum(UserRole).optional(),
      page: z.coerce.number().min(1).default(1),
      perPage: z.coerce.number().min(1).max(100).default(20),
      search: z.string().trim().optional(),
    })

    const { role, page, perPage, search } = querySchema.parse(request.query)

    const where: any = {}
    if (role) where.role = role
    if (search && search.length > 0) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    const skip = (page - 1) * perPage

    const [users, totalRecords] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarImg: true,
        },
      }),
      prisma.user.count({ where }),
    ])

    const totalPages = Math.ceil(totalRecords / perPage)

    return response.json({
      users,
      pagination: { page, perPage, totalRecords, totalPages: totalPages || 1 },
    })
  }

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

  async updateRole(request: Request, response: Response) {
    // Admin-only; change role between customer and tech
    const paramsSchema = z.object({ id: z.string().uuid("Invalid user ID") })
    const bodySchema = z.object({
      role: z.enum([UserRole.customer, UserRole.tech]),
    })

    const { id } = paramsSchema.parse(request.params)
    const { role } = bodySchema.parse(request.body)

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) throw new AppError("User not found", 404)
    if (target.role === UserRole.admin) {
      throw new AppError("Cannot modify admin role", 403)
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarImg: true,
      },
    })

    return response.json({ message: "Role updated", user: updated })
  }

  async destroy(request: Request, response: Response) {
    // Admin-only; delete if no related tickets
    const paramsSchema = z.object({ id: z.string().uuid("Invalid user ID") })
    const { id } = paramsSchema.parse(request.params)

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) throw new AppError("User not found", 404)
    if (target.role === UserRole.admin) {
      throw new AppError("Cannot delete admin user", 403)
    }

    await prisma.$transaction(async (tx) => {
      if (target.role === UserRole.customer) {
        // Delete customer's tickets and their parts (services) first
        const tickets = await tx.tickets.findMany({
          where: { userId: id },
          select: { id: true },
        })
        const ticketIds = tickets.map((t) => t.id)
        if (ticketIds.length > 0) {
          await tx.services.deleteMany({
            where: { ticketId: { in: ticketIds } },
          })
          await tx.tickets.deleteMany({ where: { id: { in: ticketIds } } })
        }
      }

      if (target.role === UserRole.tech) {
        // Unassign tickets from this tech and set status to open
        await tx.tickets.updateMany({
          where: { techId: id },
          data: { techId: null, status: "open" },
        })
      }

      await tx.user.delete({ where: { id } })
    })

    return response.status(204).send()
  }

  async uploadAvatar(request: Request, response: Response) {
    if (!request.user) {
      throw new AppError("Unauthorized", 401)
    }

    if (!request.file) {
      throw new AppError("No file uploaded", 400)
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
    })

    if (!user) {
      throw new AppError("User not found", 404)
    }

    // If there's an existing avatar, delete it
    if (user.avatarImg && user.avatarImg !== "") {
      try {
        const oldAvatarPath = path.resolve(
          __dirname,
          "..",
          "..",
          "uploads",
          "avatars",
          user.avatarImg
        )
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath)
        }
      } catch (error) {
        console.error("Failed to delete old avatar:", error)
      }
    }

    // Update user with new avatar
    const avatarFilename = request.file.filename

    const updated = await prisma.user.update({
      where: { id: request.user.id },
      data: {
        avatarImg: avatarFilename,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarImg: true,
      },
    })

    return response.json({
      message: "Avatar updated successfully",
      user: updated,
    })
  }

  async deleteAvatar(request: Request, response: Response) {
    if (!request.user) {
      throw new AppError("Unauthorized", 401)
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
    })

    if (!user) {
      throw new AppError("User not found", 404)
    }

    // If there's an existing avatar, delete it
    if (user.avatarImg && user.avatarImg !== "") {
      try {
        const oldAvatarPath = path.resolve(
          __dirname,
          "..",
          "..",
          "uploads",
          "avatars",
          user.avatarImg
        )
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath)
        }
      } catch (error) {
        console.error("Failed to delete avatar:", error)
      }
    }

    // Update user to remove avatar reference
    const updated = await prisma.user.update({
      where: { id: request.user.id },
      data: {
        avatarImg: "",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarImg: true,
      },
    })

    return response.json({
      message: "Avatar removed successfully",
      user: updated,
    })
  }
}

export { UsersController }
