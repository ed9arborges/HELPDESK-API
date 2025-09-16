import express from "express"
import path from "path"

const staticRouter = express.Router()

// Serve avatar images without authentication
staticRouter.use(
  "/uploads/avatars",
  express.static(path.resolve(__dirname, "..", "..", "uploads", "avatars"))
)

// Serve other static files that might need authentication
staticRouter.use(
  "/uploads/protected",
  express.static(path.resolve(__dirname, "..", "..", "uploads", "protected"))
)

export { staticRouter }
