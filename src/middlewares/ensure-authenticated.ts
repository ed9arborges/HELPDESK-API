import { Request, Response, NextFunction } from "express"

import { verify } from "jsonwebtoken"
import { authConfig } from "@/configs/auth"
import { AppError } from "@/utils/AppError"

interface TokenPayload {
  role: string
  sub: string
}

function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    throw new AppError("JWT token is missing", 401)
  }

  const [, token] = authHeader.split(" ")

  try {
    const { role, sub: user_id } = verify(token, authConfig.jwt.secret) as TokenPayload
    request.user = {
      id: user_id,
      role
    }
    return next()
  } catch {
    throw new AppError("Invalid JWT token", 401)
  }
}

export { ensureAuthenticated }
