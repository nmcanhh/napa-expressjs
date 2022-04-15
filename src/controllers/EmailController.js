import nodemailer from "nodemailer";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt";
import UserVerification from "../models/UserVerification.js";
import dotenv from "dotenv";

dotenv.config();

const emailAccount = {
    user: process.env.ETHEREAL_USER,
    password: process.env.ETHEREAL_PASSWORD,
}


const sendEmail = async (req, res, next) => {
    try {
        const { user, password, to, subject, textContent, htmlContent } = req.body;

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
            from: process.env.ETHEREAL_USER, // sender address
            to: `${to}`, // list of receivers
            subject: `${subject}`, // Subject line
            text: `${textContent}`, // plain text body
            html: `${htmlContent}`, // html body
        });

        console.log("from", transporter.options.auth.user);
        console.log("Message sent: %s", msg.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(msg));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

        res.send('Email sent!')
    } catch (error) {
        throw new Error(error);
    }
};

const sendVerificationEmail = async ({ _id, email }, res) => {
    let result = {
        error: '',
        data: ''
    }
    const uniqueString = uuidv4() + _id;

    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email", //https://ethereal.email/create
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "qq3hix5vmkxtoyfb@ethereal.email", // generated ethereal user
            pass: "q6tnwEt7BZKy8H9vKZ", // generated ethereal password
        },
    });

    // testing success
    transporter.verify((error, success) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Ready for messages");
            console.log(success);
        }
    });


    // hash the uniqueString
    const saltRounds = 10;
    const hashedUniqueString = await bcrypt.hash(uniqueString, saltRounds)
    const newVerification = new UserVerification({
        userId: _id,
        uniqueString: hashedUniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000,
    });

    const mailOptions = {
        from: "qq3hix5vmkxtoyfb@ethereal.email",
        to: email,
        subject: "Xác minh tài khoản",
        html: `<p>Verify your email address to complete the signup and login into your account.</p><p>This link expires in</p>
        <b>expires in 6 hours</b>.</p> <p>Press <a href=${process.env.BE_HOST + "/verify/" + _id + "/" + hashedUniqueString
            }>here</a> to proceed.</p>`,
    }

    await Promise.all([
        newVerification.save().catch(e => result.error = {
            status: "Failed!",
            message: "An error occurred while hashing email data!"
        }),
        transporter.sendMail(mailOptions).catch((error) => {
            console.log(error)
        })
    ])

    result.data = {
        status: "Pending!",
        message: "Verification email sent!",
    };
    return result
}


export default {
    sendEmail,
    sendVerificationEmail
};
