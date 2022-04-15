import { Router } from "express";
import AuthController from "../controllers/AuthController.js"
import UserController from "../controllers/UserController.js"
import UserModel from "../models/UserModel.js";
import UserVerification from "../models/UserVerification.js";
import bcrypt from "bcrypt";

function VerifyRoute() {
    const router = Router();

    router.get("/verify/:userId/:uniqueString", async (req, res, next) => {
        let { userId, uniqueString } = req.params;
        UserVerification.find({ userId }).then(result => {
            if (result.length > 0) {
                // user verification record exists so we proceed

                const { expiresAt } = result[0];
                const hashedUniqueString = result[0].uniqueString;

                // checking for expired unique string
                if (expiresAt < Date.now()) {
                    // record has expired so we delete it
                    UserVerification.deleteOne({ userId }).then(result => {
                        UserModel.deleteOne({ _id: userId }).then(() => {
                            let message = "Link has expired. Please sign up again.";
                            res.redirect(`/verified/error=true & message=${message}`);
                        }).catch(err => {
                            let message = "Clearing user with expired unique string failed.";
                            res.redirect(`/verified/error=true & message=${message}`);
                        })
                    }).catch(err => {
                        console.log(err);
                        let message = "An error occurred while clearing expired user verification record.";
                        res.redirect(`/verified/error=true&message=${message}`);
                    })

                } else {
                    // valid record exists so we validate the user string
                    // First compare the hashed unique string
                    bcrypt.compare(uniqueString, hashedUniqueString).then(result => {
                        if (result) {
                            // string match
                            UserModel.updateOne({ _id: userId }, { verified: true }).then(() => {
                                UserVerification.deleteOne({ userId }).then(() => {
                                    res.json("Verified!")
                                }).catch(err => {
                                    console.log(error);
                                    let message = "An error occurred while finalizing successful verification.";
                                    res.redirect(`/verified/error=true&message=${message}`);
                                })
                            }).catch(err => {
                                console.log(error);
                                let message = "An error occurred while updating user record to show verified.";
                                res.redirect(`/verified/error=true&message=${message}`);
                            })

                        } else {
                            // existing record but incorrect verification details passed.
                            let message = "Invalid verification details passed. Check your inbox.";
                            res.redirect(`/verified/error=true&message=${message}`);
                        }
                    }
                    ).catch(err => {
                        let message = "An error occurred while comparing unique strings.";
                        res.redirect(`/verified/error=true&message=${message}`);
                    })
                }
            } else {
                // user verification record doesn't exist
                let message = "Account record doesn't exist or has been verified already. Please sign up or log in.";
                res.redirect(`/verified/error=true&message=${message}`);
            }
        }).catch(err => {
            console.log(err);
            let message = "An error occurred while checking for existing user verification record";
            res.redirect(`/verified/error=true&message=${message}`);
        });
    });


    return router;

}
export default VerifyRoute;
