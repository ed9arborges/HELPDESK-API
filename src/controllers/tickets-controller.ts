import { Request, Response } from "express"
import prisma from "@/database/prisma"
import { z } from "zod"
import { AppError } from "@/utils/AppError"

const CategoriesEnum = z.enum([
  "hardware",
  "data",
  "software",
  "web",
  "network",
  "virus",
  "peripherals",
  "systems",
])

const TicketStatusEnum = z.enum(["open", "in_progress", "closed"])

class TicketsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      title: z.string().trim().min(1, "Title is required"),
      category: CategoriesEnum,
      description: z.string().min(10),
      status: TicketStatusEnum.optional().default("open"),
      techId: z.string().nullable().optional(),
      estimate: z.coerce.number().optional(),
    })

    const { title, category, description, status, estimate } =
      bodySchema.parse(request.body)

    if (!request.user?.id) {
      throw new AppError("Unauthorized", 401)
    }

    const ticket = await prisma.requests.create({
      data: {
        title,
        category,
        description,
        status: status || "open",
        estimate: estimate ?? 0,
        filename: "",
        userId: request.user.id,
      },
    })

    return response.status(201).json({ message: "Ticket created!", ticket })
  }

  async index(request: Request, response: Response) {
    if (!request.user?.id) {
      throw new AppError("Unauthorized", 401)
    }

    const querySchema = z.object({
      name: z.string().optional().default(""),
      page: z.coerce.number().min(1).default(1),
      perPage: z.coerce.number().min(1).max(100).default(10),
    })

    const { page, perPage } = querySchema.parse(request.query)

    const skip = (page - 1) * perPage

    const tickets = await prisma.requests.findMany({
      skip,
      take: perPage,
      where: {
        userId: request.user.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
      },
    })

    const totalRecords = await prisma.requests.count({
      where: {
        userId: request.user.id,
      },
    })

    const totalPages = Math.ceil(totalRecords / perPage)

    return response.status(200).json({
      tickets,
      pagination: {
        page,
        perPage,
        totalRecords,
        totalPages: totalPages > 0 ? totalPages : 1,
      },
    })
  }

  async show(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid("Invalid ticket ID"),
    })

    const { id } = paramsSchema.parse(request.params)

    const ticket = await prisma.requests.findFirst({
      where: { id },
      include: { user: true },
    })

    if (!ticket) {
      throw new AppError("Ticket not found", 404)
    }

    return response.status(200).json(ticket)
  }
}

export { TicketsController }
