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
    const errors = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }))

    const message = errors[0]?.message || "Validation error"

    return response.status(400).json({
      message,
      errors,
      // Keep the full formatted structure for clients that rely on it
      issues: error.format(),
    })
  }

  return response.status(500).json({ message: error.message })
}
