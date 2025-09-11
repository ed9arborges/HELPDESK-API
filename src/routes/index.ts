import { Router } from "express"

import { usersRoutes } from "./users-routes"
import { sessionsRoutes } from "./sessions-routes"
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"

import { ticketsRoutes } from "./tickets-routes"

const routes = Router()

routes.use("/users", usersRoutes)
routes.use("/sessions", sessionsRoutes)

// Protected routes with ensureAuthenticated middleware
routes.use(ensureAuthenticated);
routes.use("/tickets", ticketsRoutes);

export { routes }
