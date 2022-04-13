import express from "express";
import { Router } from "express";
import { UserModel } from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from 'axios';
import passport from 'passport';


function GoogleRoute() {
    const router = Router();

    const userStatus = {
        inactive: "inactive",
        active: "active",
    };

    const isLoggedIn = (req, res, next) => {
        req.user ? next() : res.sendStatus(401);
    };

    router.get(
        "/",
        passport.authenticate("google", { scope: ["email", "profile"] })
    );
    router.get(
        "/callback",
        passport.authenticate("google", {
            successRedirect: "/auth/google/protected",
            failureRedirect: "/auth/google/failure",
        })
    );

    router.get("/failure", (req, res, next) => {
        res.send("Something went wrong!");
    });

    router.get("/protected", isLoggedIn, async (req, res, next) => {
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
                role: 0,
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

    return router;
}
export default GoogleRoute;
