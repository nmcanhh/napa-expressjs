import bcrypt from "bcrypt";
import { UserModel } from "../models/index.js";
import EmailController from "./EmailController.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";


const PAGE_SIZE = 10;

const emailAccount = {
    user: "qq3hix5vmkxtoyfb@ethereal.email",
    password: "q6tnwEt7BZKy8H9vKZ",
}


const createUser = async (req, res, next) => {
    try {
        var email = req.body.email;
        var password = req.body.password;
        const saltRounds = 10;

        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(password, salt);

        const user = await UserModel.findOne({
            email: email,
        });

        // const compare = bcrypt.compareSync("12345rqwr6789", user.password); // true

        if (user) {
            return res.status(400).json({
                code: 400,
                message: "Account already exists!",
            });
        }

        const create = await UserModel.create({
            email: email,
            password: hash,
            role: 0,
            verified: false
        });

        const result = create.toObject();
        delete result.password;

        const { error, data } = await EmailController.sendVerificationEmail({ _id: result._id, email }, res);

        if (error) {
            res.send(error);
        }
        return res.send(result);
    } catch (error) {
        throw new Error(error);
    }
};

const getAllUsers = (req, res, next) => {
    var page = req.query.page;
    if (page) {
        // Get Page
        page = parseInt(page);
        if (page < 0) {
            page = 1;
        }
        var skipLength = (page - 1) * PAGE_SIZE;

        UserModel.find({})
            .skip(skipLength)
            .limit(PAGE_SIZE)
            .then((data) => {
                UserModel.countDocuments({}).then((total) => {
                    var totalPages = Math.ceil(total / PAGE_SIZE);
                    res.status(200).json({
                        totalPages: totalPages,
                        data: data,
                    });
                });
            })
            .catch((err) => {
                res.status(500).json("Lỗi Server!");
            });
    } else {
        // Get All User
        UserModel.find({})
            .then((data) => {
                // find({}) tìm tất cả thì để {}
                res.status(200).json(data);
            })
            .catch((err) => {
                res.status(500).json("Lỗi Server!");
            });
    }
}

const getUserDetail = (req, res, next) => {
    var id = req.params.id;

    UserModel.findById(id)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((err) => {
            res.status(500).json("Lỗi Server!");
        });
}

const changePassword = (req, res, next) => {
    var id = req.params.id;

    var newPassword = req.body.newPassword;

    UserModel.findByIdAndUpdate(id, {
        password: newPassword, // line này truyền giá trị cần thay đổi trong database
    })
        .then((data) => {
            res.status(200).json("Cập nhật mật khẩu thành công!");
        })
        .catch((err) => {
            res.status(500).json("Cập nhật mật khẩu thất bại!");
        });
};



const forgotPassword = async (req, res, next) => {
    const email = req.body.email;

    const user = await UserModel.findOne({
        email: email,
    }).exec();

    if (!user) {
        return res.status(400).json({
            code: 400,
            message: "Account does not exist!",
        });
    }

    // User exist and now create a one time link valid for 15 minutes

    const payload = {
        email: user.email,
        id: user.id
    }

    const token = jwt.sign(payload, process.env.JWT_SCERET, { expiresIn: "15m" });

    const callbackURL = `${process.env.BE_HOST}/api/user/reset-password/${user.id}/${token}`

    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email", //https://ethereal.email/create
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: emailAccount.user, // generated ethereal user
            pass: emailAccount.password, // generated ethereal password
        },
    });

    // send mail with defined transport object
    const msg = await transporter.sendMail({
        from: emailAccount.user, // sender address
        to: `${email}`, // list of receivers
        subject: "ExpressJS: Reset your password", // Subject line
        text: `${callbackURL}`, // plain text body
        html: `${callbackURL}`, // html body
    });

    console.log(callbackURL);

    res.send('Password reset link has been sent to your email!');
};

const checkResetPasswordURL = async (req, res, next) => {
    const { id, token } = req.params;

    const payload = jwt.verify(token, process.env.JWT_SCERET);

    console.log(payload);

    // const user = await UserModel.findOne({
    //     email: email,
    // });

    // if (id !== user.id) {
    //     return res.send('Invalid URL!');
    // }

    // const secret = process.env.JWT_SCERET + user.password;

    try {
        const payload = jwt.verify(token, secret);
        return console.log(payload);
        // res.render('reset-password', { email: user.email });
    } catch (error) {
        throw new Error(error);
    }
}

const resetPassword = async (req, res, next) => {
    const { id, token } = req.params;
    const { password } = req.body.password;

    const payload = jwt.verify(token, process.env.JWT_SCERET);

    console.log(payload);

    const user = await UserModel.findOne({
        email: payload.email,
    });

    // Check if this exist in database
    if (!user) {
        return res.status(400).json({
            code: 400,
            message: "Account does not exist!",
        });
    }

    try {
        //validate password and password2 should match
        // we can simply Gind the user with the payload emaie and id and finally update with new password
        // alwasy hash the password before saving
        user.password = password;
        return res.status(200).json({
            code: 200,
            message: "Password Change Successful. Your password was successfully changed!",
        });

    } catch (error) {
        throw new Error(error);
    }

}

const updateUser = async (req, res, next) => {
    try {
        var id = req.params.id;
        var status = req.body.status;
        var fullName = req.body.fullName;
        var role = req.body.role;
        var verified = req.body.verified;

        const userInfo = await UserModel.findByIdAndUpdate(id, {
            status,
            fullName,
            role,
            verified
        });

        const result = userInfo.toObject();

        delete result.password;

        return res.json(result);
    } catch (error) {
        throw new Error(error);
    }
};

const deleteUser = (req, res, next) => {
    var id = req.params.id;

    UserModel.deleteOne({
        _id: id,
    })
        .then((data) => {
            res.status(200).json("Xoá tài khoản thành công!");
        })
        .catch((err) => {
            res.status(500).json("Xoá tài khoản thất bại!");
        });
};

export default {
    createUser,
    getAllUsers,
    getUserDetail,
    changePassword,
    forgotPassword,
    checkResetPasswordURL,
    resetPassword,
    updateUser,
    deleteUser
};