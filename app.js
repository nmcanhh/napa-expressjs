import express from "express";
import bodyParser from "body-parser";
import passport from "passport";
import dotenv from "dotenv";
import init from "./src/init/index.js";
import UserRoute from "./src/routes/UserRoute.js";
import AuthRoute from "./src/routes/AuthRoute.js";
import bcrypt from "bcrypt";
import { UserModel } from "./src/models/index.js";
import jwt from "jsonwebtoken";

const port = 3000;
const server = async () => {
  const app = express();
  app.use(
    bodyParser.urlencoded({
      extended: false,
    })
  );
  app.use(bodyParser.json());

  await init(app);

  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); //example.com
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

  const isLoggedIn = (req, res, next) => {
    req.user ? next() : res.sendStatus(401);
  };

  const userStatus = {
    inactive: "inactive",
    active: "active",
  };

  app.use("/api/user/", UserRoute);
  app.use("/auth/", AuthRoute);

  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
  );
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "/auth/google/protected",
      failureRedirect: "/auth/google/failure",
    })
  );

  app.get("/auth/google/failure", (req, res, next) => {
    res.send("Something went wrong!");
  });

  app.get("/auth/google/protected", isLoggedIn, async (req, res, next) => {
    try {
      const userInfo = req.user._json;
      const user = await UserModel.findOne({
        googleId: userInfo.sub,
      }).exec();

      let token;

      if (user && user.status === userStatus.inactive) {
        throw new Error(
          JSON.stringify({
            code: 403,
            message: "Inactive User",
          })
        );
      }

      if (user && user.status === userStatus.active) {
        token = jwt.sign(
          {
            _id: user._id,
          },
          "nmcanhh_signature",
          {
            expiresIn: "7d",
          }
        );
        return res.redirect(`${process.env.BE_HOST}?token=${token}`);
      }

      const createOne = await UserModel.create({
        googleId: userInfo.sub,
        firstName: userInfo.family_name,
        lastName: userInfo.given_name,
        email: userInfo.email,
        profilePhoto: userInfo.picture,
        status: userStatus.active,
        role: "member",
      });

      token = jwt.sign(
        {
          _id: createOne._id,
        },
        "nmcanhh_signature",
        {
          expiresIn: "7d",
        }
      );

      return res.redirect(`${process.env.BE_HOST}?token=${token}`);
    } catch (error) {
      throw new Error(error);
    }
  });

  app.get("/auth/github", (req, res) => {
    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=44656768f3d173fe9945`
    );
  });

  app.get("/auth/github/callback", async (req, res) => {
    try {
      const body = {
        client_id: "44656768f3d173fe9945",
        client_secret: "11b933014b2d048a2ef4b71b1f20297f25c7c434",
        code: req.query.code,
      };

      const opts = { headers: { accept: "application/json" } };
      const response = await axios.post(
        "https://github.com/login/oauth/access_token",
        body,
        opts
      );

      //  return response?.data?.access_token;

      const { data: userInfo } = await axios.get(
        "https://api.github.com/user",
        {
          headers: {
            Authorization: `token ${response.data.access_token}`,
          },
        }
      );

      const user = await UserModel.findOne({
        githubId: userInfo.id,
      }).exec();

      let token;

      if (user && user.status === userStatus.inactive) {
        throw new Error(
          JSON.stringify({
            code: 403,
            message: "Inactive User",
          })
        );
      }

      if (user && user.status === userStatus.active) {
        token = jwt.sign(
          {
            _id: user._id,
          },
          "nmcanhh_signature",
          {
            expiresIn: "7d",
          }
        );
        return res.redirect(`${process.env.BE_HOST}?token=${token}`);
      }

      const createOne = await UserModel.create({
        githubId: userInfo.id,
        // firstName: userInfo.family_name,
        // lastName: userInfo.given_name,
        fullName: userInfo.name,
        email: userInfo.email,
        profilePhoto: userInfo.avatar_url,
        status: userStatus.active,
        role: "member",
      });

      token = jwt.sign(
        {
          _id: createOne._id,
        },
        "nmcanhh_signature",
        {
          expiresIn: "7d",
        }
      );

      return res.redirect(`${process.env.BE_HOST}?token=${token}`);

      // console.log(req);
    } catch (error) {
      throw new Error(error);
    }
  });

  app.get("/auth/github/failure", (req, res, next) => {
    res.send("Something went wrong!");
  });

  app.get("/auth/github/protected", isLoggedIn, async (req, res, next) => {
    try {
      const userInfo = req.user;
      const user = await UserModel.findOne({
        githubId: userInfo.id,
      }).exec();

      let token;

      if (user && user.status === userStatus.inactive) {
        throw new Error(
          JSON.stringify({
            code: 403,
            message: "Inactive User",
          })
        );
      }

      if (user && user.status === userStatus.active) {
        token = jwt.sign(
          {
            _id: user._id,
          },
          "nmcanhh_signature",
          {
            expiresIn: "7d",
          }
        );
        return res.redirect(`${process.env.BE_HOST}?token=${token}`);
      }

      const createOne = await UserModel.create({
        githubId: userInfo.id,
        firstName: userInfo.family_name,
        lastName: userInfo.given_name,
        fullName: userInfo.displayName,
        email: userInfo._json.email,
        profilePhoto: userInfo._json.avatar_url,
        status: userStatus.active,
      });

      token = jwt.sign(
        {
          _id: user._id,
        },
        "nmcanhh_signature",
        {
          expiresIn: "7d",
        }
      );

      return res.redirect(`${process.env.BE_HOST}?token=${token}`);
    } catch (error) {
      throw new Error(error);
    }
  });

  app.get("/logout", (req, res) => {
    req.logout();
    req.session.destroy();
    res.send("Goodbye!");
  });

  app.get("/", (req, res, next) => {
    res.json("Home");
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
  });
};

server();
