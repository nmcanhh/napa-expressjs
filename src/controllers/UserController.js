import bcrypt from "bcrypt";
import { UserModel } from "../models/index.js";
import jwt from "jsonwebtoken";

const PAGE_SIZE = 10;

const createUser = async (req, res, next) => {
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
    deleteUser
};