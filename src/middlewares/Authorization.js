import enumCommon from "../constants/enumCommon.js"

const checkRole = (req, res, next) => {
    var role = req.user.role;
    if (role === enumCommon.roleName.admin) {
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
