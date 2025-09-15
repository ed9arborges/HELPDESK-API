import { Request, Response } from "express"
import prisma from "@/database/prisma"
import { z } from "zod"
import { AppError } from "@/utils/AppError"

class ServicesController {
  // Public list for authenticated users: catalog services
  async index(request: Request, response: Response) {
    if (!request.user?.id) throw new AppError("Unauthorized", 401)

    const querySchema = z.object({
      q: z.string().optional(),
    })
    const { q } = querySchema.parse(request.query)

    const where: any = {}
    if (q && q.trim()) {
      where.name = { contains: q.trim(), mode: "insensitive" }
    }

    // @ts-ignore delegate will exist after prisma generate
    const services = await prisma.categoryServices.findMany({
      where,
      orderBy: [{ name: "asc" }],
    })

    return response.status(200).json({ services })
  }

  // Admin: create a catalog service
  async create(request: Request, response: Response) {
    if (!request.user) throw new AppError("Unauthorized", 401)
    if (request.user.role !== "admin") throw new AppError("Forbidden", 403)

    const bodySchema = z.object({
      name: z.string().trim().min(1, "Name is required"),
      amount: z.coerce.number().min(0, { message: "Amount must be >= 0" }),
    })

    const { name, amount } = bodySchema.parse(request.body)

    // @ts-ignore delegate will exist after prisma generate
    const created = await prisma.categoryServices.create({
      data: { name, amount },
    })

    return response
      .status(201)
      .json({ message: "Service created", service: created })
  }

  // Admin: update a catalog service
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

    // @ts-ignore delegate will exist after prisma generate
    const exists = await prisma.categoryServices.findFirst({
      where: { id },
    })
    if (!exists) throw new AppError("Service not found", 404)

    // @ts-ignore delegate will exist after prisma generate
    const updated = await prisma.categoryServices.update({
      where: { id },
      data: { ...payload },
    })

    return response
      .status(200)
      .json({ message: "Service updated", service: updated })
  }

  // Admin: delete a catalog service
  async destroy(request: Request, response: Response) {
    if (!request.user) throw new AppError("Unauthorized", 401)
    if (request.user.role !== "admin") throw new AppError("Forbidden", 403)

    const paramsSchema = z.object({ id: z.string().uuid("Invalid ID") })
    const { id } = paramsSchema.parse(request.params)

    // @ts-ignore delegate will exist after prisma generate
    const exists = await prisma.categoryServices.findFirst({
      where: { id },
    })
    if (!exists) throw new AppError("Service not found", 404)

    // @ts-ignore delegate will exist after prisma generate
    await prisma.categoryServices.delete({ where: { id } })
    return response.status(204).send()
  }
}

export { ServicesController }
