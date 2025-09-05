import { Request, Response } from "express"
import { z } from "zod"

class SessionsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      email: z.string().email({ message: "Invalid email" }),
      password: z.string().min(6).max(100),
    })

    const { email, password } = bodySchema.parse(request.body)

    
    return response.status(400).json({ email, password })
    

  }
}

export { SessionsController }