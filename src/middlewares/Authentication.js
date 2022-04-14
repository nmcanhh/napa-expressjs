import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";



const checkLogin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1];
        var idUser = jwt.verify(token, "nmcanhh_signature");
        const user = await UserModel.findOne({
            _id: idUser._id,
        }).exec();
        req.user = {
            ...req.user,
            role: user.role,
        };
        console.log(user);
        next();
    } catch (err) {
        throw new Error(err);
    }
};

export default {
    checkLogin,
};
