import { AppError } from "@/utils/AppError"
import { ErrorRequestHandler } from "express"
import { ZodError } from "zod"

export const errorHandling: ErrorRequestHandler = (
  error,
  request,
  response,
  next
) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({ message: error.message })
  }

  if (error instanceof ZodError) {
    return response
      .status(400)
      .json({ message: "validation error", issues: error.format() })
  }

  return response.status(500).json({ message: error.message })
}
