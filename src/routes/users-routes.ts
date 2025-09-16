import { Router } from "express"

import { UsersController } from "@/controllers/users-controller"
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization"

const usersRoutes = Router()
const usersController = new UsersController()

usersRoutes.post("/", usersController.create)
usersRoutes.put("/me", ensureAuthenticated, usersController.updateMe)

// Admin-only management endpoints
usersRoutes.get(
  "/",
  ensureAuthenticated,
  verifyUserAuthorization(["admin"]),
  usersController.index
)
usersRoutes.patch(
  "/:id/role",
  ensureAuthenticated,
  verifyUserAuthorization(["admin"]),
  usersController.updateRole
)
usersRoutes.delete(
  "/:id",
  ensureAuthenticated,
  verifyUserAuthorization(["admin"]),
  usersController.destroy
)

export { usersRoutes }
