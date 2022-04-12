import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import dotenv from 'dotenv';
import init from './src/init/index.js';

const server = async () => {
    const app = express();
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());

    await init(app);

    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*'); //example.com
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    })

    app.use('/api/user/', userRouter);
    app.use('/auth/', authRouter);


    app.listen(port, () => {
        console.log(`Example app listening on port ${process.env.PORT}`);
    })
}

server();