import { Router } from "express"

import { RequestsController } from "@/controllers/requests-controller"
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization"

const requestsRoutes = Router()
const requestsController = new RequestsController()

requestsRoutes.post("/", verifyUserAuthorization(["customer"]), requestsController.create)

requestsRoutes.get(
  "/",
  verifyUserAuthorization(["tech", "customer", "admin"]),
  requestsController.index
)

requestsRoutes.get(
  "/:id",
  verifyUserAuthorization(["tech", "customer", "admin"]),
  requestsController.show
)

export { requestsRoutes }
