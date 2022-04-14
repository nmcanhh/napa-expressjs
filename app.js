import express from "express";
import bodyParser from "body-parser";
import passport from "passport";
import init from "./src/init/index.js";
import UserRoute from "./src/routes/UserRoute.js";
import AuthRoute from "./src/routes/AuthRoute.js";
import GithubRoute from "./src/routes/GithubRoute.js";
import GoogleRoute from "./src/routes/GoogleRoute.js";
import GoogleStrategy from 'passport-google-oauth2';
import EmailRoute from "./src/routes/EmailRoute.js";
import VerifyRoute from "./src/routes/VerifyRoute.js";



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

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true
    },
        function (request, accessToken, refreshToken, profile, done) {
            return done(null, profile);
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(function (user, done) {
        done(null, user);
    });



    app.use("/api/user/", UserRoute());
    app.use("/auth/", AuthRoute());
    app.use("/auth/github/", GithubRoute());
    app.use("/auth/google/", GoogleRoute());
    app.use("/api/send-email/", EmailRoute());
    app.use("/", VerifyRoute());


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