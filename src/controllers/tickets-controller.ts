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

    const { title, category, description, status, estimate } = bodySchema.parse(
      request.body
    )

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

    const isCustomer = request.user.role === "customer"

    const whereClause = isCustomer ? { userId: request.user.id } : {} // tech/admin can list all for now (could be filtered by techId if desired)

    const tickets = await prisma.requests.findMany({
      skip,
      take: perPage,
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        tech: true,
      },
    })

    const totalRecords = await prisma.requests.count({ where: whereClause })

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
      include: { user: true, tech: true },
    })

    if (!ticket) {
      throw new AppError("Ticket not found", 404)
    }

    return response.status(200).json(ticket)
  }

  async update(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid("Invalid ticket ID"),
    })
    const bodySchema = z
      .object({
        title: z.string().trim().min(1).optional(),
        description: z.string().trim().min(1).optional(),
        category: CategoriesEnum.optional(),
        status: TicketStatusEnum.optional(),
        estimate: z.coerce.number().min(0).optional(),
        techId: z.string().uuid().nullable().optional(),
      })
      .refine((data) => Object.keys(data).length > 0, {
        message: "No fields to update",
      })

    if (!request.user) throw new AppError("Unauthorized", 401)
    if (request.user.role !== "admin") {
      throw new AppError("Forbidden", 403)
    }

    const { id } = paramsSchema.parse(request.params)
    const payload = bodySchema.parse(request.body)

    const exists = await prisma.requests.findUnique({ where: { id } })
    if (!exists) throw new AppError("Ticket not found", 404)

    const updated = await prisma.requests.update({
      where: { id },
      data: {
        ...payload,
      },
      include: { user: true, tech: true },
    })

    return response
      .status(200)
      .json({ message: "Ticket updated", ticket: updated })
  }

  async destroy(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid("Invalid ticket ID"),
    })
    if (!request.user) throw new AppError("Unauthorized", 401)
    if (request.user.role !== "admin") {
      throw new AppError("Forbidden", 403)
    }
    const { id } = paramsSchema.parse(request.params)

    const exists = await prisma.requests.findUnique({ where: { id } })
    if (!exists) throw new AppError("Ticket not found", 404)

    await prisma.requests.delete({ where: { id } })
    return response.status(204).send()
  }

  async assignSelf(request: Request, response: Response) {
    if (!request.user?.id) throw new AppError("Unauthorized", 401)

    const paramsSchema = z.object({ id: z.string().uuid("Invalid ticket ID") })
    const { id } = paramsSchema.parse(request.params)

    const ticket = await prisma.requests.findUnique({ where: { id } })
    if (!ticket) throw new AppError("Ticket not found", 404)

    if (ticket.techId && ticket.techId !== request.user.id) {
      throw new AppError("Ticket already assigned to another technician", 409)
    }

    const updated = await prisma.requests.update({
      where: { id },
      data: { techId: request.user.id },
      include: { user: true, tech: true },
    })

    return response
      .status(200)
      .json({ message: "Assigned to you", ticket: updated })
  }
}

export { TicketsController }
