import express from "express";
import { Router } from "express";
import { UserModel } from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import AuthController from "../controllers/AuthController.js"
import UserController from "../controllers/UserController.js"

function AuthRoute() {
  const router = Router();

  router.post("/register", UserController.createUser);

  router.post("/login", AuthController.login);

  return router
}
export default AuthRoute;
