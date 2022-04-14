import { Router } from "express";
import UserController from "../controllers/UserController.js"
import Authorization from "../middlewares/Authorization.js"
import Authentication from "../middlewares/Authentication.js"

function UserRoute() {

  const router = Router();

  router.get("/", Authentication.checkLogin, Authorization.checkRole, UserController.getAllUsers);

  router.get("/:id", UserController.getUserDetail);

  router.post("/create", UserController.createUser);

  router.put("/change-password/:id", UserController.changePassword);

  router.delete("/delete/:id", UserController.deleteUser);

  return router
}
export default UserRoute;
