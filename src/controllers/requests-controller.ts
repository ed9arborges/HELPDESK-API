import { Request, Response } from "express"
import prisma from "@/database/prisma"
import { z } from "zod"
import { AppError } from "@/utils/AppError"

const CategoriesEnum = z.enum(["hardware","data", "software", "web","network","virus","peripherals","systems"])

class RequestsController {
  async create(request: Request, response: Response) {
   const bodySchema = z.object({
      name: z.string().trim().min(1, "Name is required"),
      category: CategoriesEnum,      
      description: z.string().min(10),
      userId: z.string(),
      techId: z.string().nullable().optional(),
    })

    const { name, category, description, userId, techId } = bodySchema.parse(request.body)

    if(!request.user?.id){
      throw new AppError("Unauthorized", 401)
    }

    const req = await prisma.requests.create({
      data: {
        name,
        category,
        description,
        estimate: 0,
        filename: "",
        userId: request.user.id,       
      },
    })

    return response.status(201).json({ message: "Refund request created!", req })
  }
}

export { RequestsController }
