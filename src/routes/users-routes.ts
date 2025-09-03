import { Router } from "express";

import { UsersController } from "@/controlers/users-controlers";

const usersRoutes = Router();
const usersController = new UsersController();

usersRoutes.post("/",  usersController.create);

export { usersRoutes };