import { Request, Response } from "express"

class RequestsController {
  async create(request: Request, response: Response) {
    return response.status(201).json({ message: "Refund request!" })
  }
}

export { RequestsController }
