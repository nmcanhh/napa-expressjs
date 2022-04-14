import { Router } from "express";
import { UserModel } from "../models/index.js";
import jwt from "jsonwebtoken";
import splitName from "../services/splitName.js";
import axios from 'axios';
import enumCommon from "../constants/enumCommon.js";


function GithubRoute() {

  const router = Router();

  const isLoggedIn = (req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.sendStatus(401);
    }
  };

  router.get('/', (req, res) => {
    res.redirect(`https://github.com/login/oauth/authorize?client_id=44656768f3d173fe9945`);
  });

  router.get('/callback', async (req, res) => {
    try {
      const body = {
        client_id: '44656768f3d173fe9945',
        client_secret: '11b933014b2d048a2ef4b71b1f20297f25c7c434',
        code: req.query.code,
      };

      const opts = { headers: { accept: 'application/json' } };
      const response = await axios.post('https://github.com/login/oauth/access_token', body, opts);

      //  return response?.data?.access_token;

      const { data: userInfo } = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `token ${response.data.access_token}`,
        },
      });

      const user = await UserModel.findOne({
        githubId: userInfo.id,
      }).exec();

      let token;

      if (user && user.status === enumCommon.userStatus.inactive) {
        throw new Error(JSON.stringify({
          code: 403,
          message: 'Inactive User',
        }));
      }

      if (user && user.status === enumCommon.userStatus.active) {
        token = jwt.sign({
          _id: user._id
        }, 'nmcanhh_signature', {
          expiresIn: "7d"
        })
        return res.redirect(`${process.env.BE_HOST}?token=${token}`);
      }

      const createOne = await UserModel.create({
        githubId: userInfo.id,
        firstName: splitName.splitToFirstName(userInfo.name),
        lastName: splitName.splitToLastName(userInfo.name),
        fullName: userInfo.name,
        email: userInfo.email,
        profilePhoto: userInfo.avatar_url,
        status: enumCommon.userStatus.active,
        role: 0
      });

      token = jwt.sign({
        _id: createOne._id
      }, 'nmcanhh_signature', {
        expiresIn: "7d"
      })

      return res.redirect(`${process.env.BE_HOST}?token=${token}`);

      // console.log(req);
    } catch (error) {
      throw new Error(error)
    }
  });

  router.get('/failure', (req, res, next) => {
    res.send('Something went wrong!');
  });

  router.get('/protected', isLoggedIn, async (req, res, next) => {
    try {
      const userInfo = req.user;
      const user = await UserModel.findOne({
        githubId: userInfo.id,
      }).exec();

      let token;

      if (user && user.status === enumCommon.userStatus.inactive) {
        throw new Error(JSON.stringify({
          code: 403,
          message: 'Inactive User',
        }));
      }

      if (user && user.status === enumCommon.userStatus.active) {
        token = jwt.sign({
          _id: user._id
        }, 'nmcanhh_signature', {
          expiresIn: "7d"
        })
        return res.redirect(`${process.env.BE_HOST}?token=${token}`);
      }

      const createOne = await UserModel.create({
        githubId: userInfo.id,
        firstName: userInfo.family_name,
        lastName: userInfo.given_name,
        fullName: userInfo.displayName,
        email: userInfo._json.email,
        profilePhoto: userInfo._json.avatar_url,
        status: enumCommon.userStatus.active,
      });

      token = jwt.sign({
        _id: user._id
      }, 'nmcanhh_signature', {
        expiresIn: "7d"
      })

      return res.redirect(`${process.env.BE_HOST}?token=${token}`);
    } catch (error) {
      throw new Error(error)
    }
  });

  return router;
}
export default GithubRoute;
