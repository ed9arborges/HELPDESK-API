import express from "express"
import path from "path"
import { avatarsDir, protectedDir } from "@/configs/upload"

const staticRouter = express.Router()

// Serve avatar images without authentication
staticRouter.use("/uploads/avatars", express.static(avatarsDir))

// Serve other static files that might need authentication
staticRouter.use("/uploads/protected", express.static(protectedDir))

export { staticRouter }
