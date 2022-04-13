import express from "express";
import { Router } from "express";
import { UserModel } from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

function AuthRoute() {
  const router = Router();

  router.post("/register", async (req, res, next) => {
    try {
      var username = req.body.username;
      var password = req.body.password;
      const saltRounds = 10;

      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(password, salt);
      const user = await UserModel.findOne({
        username: username,
      });

      // const compare = bcrypt.compareSync("12345rqwr6789", user.password); // true

      if (user) {
        return res.status(400).json({
          code: 400,
          message: "Account already exists!",
        });
      }

      const create = await UserModel.create({
        username,
        password: hash,
        role: "member",
      });

      const result = create.toObject();
      delete result.password;

      return res.send({
        result,
      });
    } catch (error) {
      throw new Error(error);
    }
  });

  router.post("/login", async (req, res, next) => {
    try {
      var username = req.body.username;
      var password = req.body.password;

      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(password, salt);

      const user = await UserModel.findOne({
        username: username,
      }).exec();
      if (!user) {
        return res.status(400).json({
          code: 400,
          message: "Account does not exist!",
        });
      }

      const compare = bcrypt.compareSync(password, user.password);

      if (!compare) {
        return res.status(400).json({
          code: 400,
          message: "Account or password is wrong!",
        });
      }
      var token = jwt.sign(
        {
          _id: user._id,
        },
        "nmcanhh_signature",
        {
          expiresIn: "7d",
        }
      );
      return res.json({
        message: "Create account success!",
        token: token,
      });
    } catch (error) {
      throw new Error(error);
    }
  });
}
export default AuthRoute;
