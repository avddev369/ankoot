const jwt = require('jsonwebtoken');
const db = require("../models");
const myRes = require("../utils/responseHandler");


// Change according to use, as it's configured not according to user table
exports.registerUser = (req, res) => {
    if (params.verifyParam(req, res) === true) {
        const tokenPayload = {
            id: 1,
        };
        const token = jwt.generateToken(tokenPayload);
        const refreshToken = jwt.generateRefreshToken(tokenPayload);


        db.user.create({
            username: req.body['user_token'],
            email: req.body['email'],
            phone: req.body['phone'],
            password: req.body['password'],
            // user_token: req.body['user_token'],  //for firebase
            // fcm_token: req.body['fcm_token'],    //for firebase
            // login_type: req.body['login_type'],  //for firebase
            // status: req.body['status'],
        }).then(user => {
            db.privacy.create({
                uid: user.user_id,
                pid: 0
            }).then(() => {
                myRes.successResponse(res, { msg: user, token: token, refreshToken: refreshToken });
            }).catch(error => {
                myRes.errorResponse(res, error.message);
            });

        }).catch(error => {
            console.log(error);
            myRes.errorResponse(res, error.message);
        });

    }
}


exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db.user.findOne({
            where: { username, password },
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        myRes.successResponse(res, {
            id: user.id,
            name: user.name,
            isMaster: user.isMaster,
            mobile: user.mobile,
            type_id: user.type_id,
            token,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
