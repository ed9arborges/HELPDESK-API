import { Request, Response } from "express"
import prisma from "@/database/prisma"
import { z } from "zod"
import { AppError } from "@/utils/AppError"

class ServicesController {
  // Public list for authenticated users: only catalog basics (isBasic=true, ticketId null)
  async index(request: Request, response: Response) {
    if (!request.user?.id) throw new AppError("Unauthorized", 401)

    const querySchema = z.object({
      q: z.string().optional(),
    })
    const { q } = querySchema.parse(request.query)

    const where: any = { isBasic: true, ticketId: null }
    if (q && q.trim()) {
      where.name = { contains: q.trim(), mode: "insensitive" }
    }

    const services = await prisma.services.findMany({
      where,
      orderBy: [{ name: "asc" }],
    })

    return response.status(200).json({ services })
  }

  // Admin: create a basic catalog service (isBasic=true)
  async create(request: Request, response: Response) {
    if (!request.user) throw new AppError("Unauthorized", 401)
    if (request.user.role !== "admin") throw new AppError("Forbidden", 403)

    const bodySchema = z.object({
      name: z.string().trim().min(1, "Name is required"),
      amount: z.coerce.number().min(0, { message: "Amount must be >= 0" }),
    })

    const { name, amount } = bodySchema.parse(request.body)

    const created = await prisma.services.create({
      data: { name, amount, isBasic: true, ticketId: null },
    })

    return response
      .status(201)
      .json({ message: "Service created", service: created })
  }

  // Admin: update a basic catalog service
  async update(request: Request, response: Response) {
    if (!request.user) throw new AppError("Unauthorized", 401)
    if (request.user.role !== "admin") throw new AppError("Forbidden", 403)

    const paramsSchema = z.object({ id: z.string().uuid("Invalid ID") })
    const bodySchema = z
      .object({
        name: z.string().trim().min(1).optional(),
        amount: z.coerce.number().min(0).optional(),
      })
      .refine((d) => Object.keys(d).length > 0, { message: "No fields" })

    const { id } = paramsSchema.parse(request.params)
    const payload = bodySchema.parse(request.body)

    const exists = await prisma.services.findFirst({
      where: { id, ticketId: null, isBasic: true },
    })
    if (!exists) throw new AppError("Service not found", 404)

    const updated = await prisma.services.update({
      where: { id },
      data: { ...payload, isBasic: true, ticketId: null },
    })

    return response
      .status(200)
      .json({ message: "Service updated", service: updated })
  }

  // Admin: delete a basic catalog service
  async destroy(request: Request, response: Response) {
    if (!request.user) throw new AppError("Unauthorized", 401)
    if (request.user.role !== "admin") throw new AppError("Forbidden", 403)

    const paramsSchema = z.object({ id: z.string().uuid("Invalid ID") })
    const { id } = paramsSchema.parse(request.params)

    const exists = await prisma.services.findFirst({
      where: { id, ticketId: null, isBasic: true },
    })
    if (!exists) throw new AppError("Service not found", 404)

    await prisma.services.delete({ where: { id } })
    return response.status(204).send()
  }
}

export { ServicesController }
