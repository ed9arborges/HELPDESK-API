import { Router } from "express"
import { ServicesController } from "@/controllers/services-controller"
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization"

const servicesRoutes = Router()
const controller = new ServicesController()

// List catalog services (all roles after auth)
servicesRoutes.get(
  "/",
  verifyUserAuthorization(["customer", "tech", "admin"]),
  controller.index
)

// Admin-only CRUD for catalog services
servicesRoutes.post("/", verifyUserAuthorization(["admin"]), controller.create)
servicesRoutes.patch(
  "/:id",
  verifyUserAuthorization(["admin"]),
  controller.update
)
servicesRoutes.delete(
  "/:id",
  verifyUserAuthorization(["admin"]),
  controller.destroy
)

export { servicesRoutes }
