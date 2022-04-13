import {
    userStatus,
    roleName,
    rolesList
} from "../constants/enum.js"

const checkRole = (req, res, next) => {
    var role = req.user.role;
    if (role === roleName.admin) {
        next();
    } else {
        return res.status(403).json({
            code: 403,
            message: 'Forbidden!',
        });
    }
};

export default {
    checkRole,
};
