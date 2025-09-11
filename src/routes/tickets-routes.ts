import { Router } from "express"

import { TicketsController } from "@/controllers/tickets-controller"
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization"

const ticketsRoutes = Router()
const ticketsController = new TicketsController()

ticketsRoutes.post(
  "/",
  verifyUserAuthorization(["customer"]),
  ticketsController.create
)

ticketsRoutes.get(
  "/",
  verifyUserAuthorization(["tech", "customer", "admin"]),
  ticketsController.index
)

ticketsRoutes.get(
  "/:id",
  verifyUserAuthorization(["tech", "customer", "admin"]),
  ticketsController.show
)

ticketsRoutes.patch(
  "/:id",
  verifyUserAuthorization(["admin"]),
  ticketsController.update
)

ticketsRoutes.delete(
  "/:id",
  verifyUserAuthorization(["admin"]),
  ticketsController.destroy
)

// Tech can assign themselves to a ticket
ticketsRoutes.post(
  "/:id/assign-self",
  verifyUserAuthorization(["tech"]),
  ticketsController.assignSelf
)

export { ticketsRoutes }
