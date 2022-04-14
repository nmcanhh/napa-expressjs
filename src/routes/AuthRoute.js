import { Router } from "express";
import AuthController from "../controllers/AuthController.js"
import UserController from "../controllers/UserController.js"

function AuthRoute() {
  const router = Router();

  router.post("/register", UserController.createUser);

  router.post("/login", AuthController.login);

  return router
}
export default AuthRoute;
