const { request, response } = require("express")
const nodemailer = require('nodemailer');
const User = require('../../Feature/User/user_model')
const handleError = require('../../Common/error_response')
const jsonwebtoken = require('jsonwebtoken')

const setVerifyEmailToTrue = async (req = request, res = response) => {
    const {_id, token} = req.query
    if (!_id || !token) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        }) 
    }

    jsonwebtoken.verify(token, process.env.PUBLIC_SECRET_KEY, async (error, decoded) => {
        if (error) {
            return res.status(401).json({
                message: error.message
            })
        }

        try {
            const user = await User.findById(decoded._id)    

            if (!user) {
                return res.status(401).json({
                    message: 'user not found'
                })            
            }

            if (!user.isEnabled) {
                return res.status(401).json({
                    message: 'user is deactivated'
                })            
            }
            user.emailVerified = true
            await user.save()
            
            res.json({
                messge: 'email verified'
            })      
        } catch (error) {
            handleError(error)
        }
    })
}

const sendEmail = (req = request, res = response) => {
    const {email} = req.body

    if (!email) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        }) 
    }

    const tokenForEmail = jsonwebtoken.sign({ _id: req.user._id }, 'Authorization', { expiresIn: 60 * 5 })

    const host = req.headers.host
    let domain = "https://"
    if (host.includes('127.0.0.1:')) {
        domain = "http://";
    }

    const _id = req.user._id
    const link = `${domain}${host}/api/v1/verifyEmail?_id=${_id}&token=${tokenForEmail}`
    
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 40px;
            }
            .container {
                background-color: #f9f9f9;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            }
            .verify-link {
                color: #007bff;
                text-decoration: none;
            }
            .verify-link:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Email Verification</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${link}" class="verify-link">Verify My Email</a>
            <p>If you did not request this verification, please ignore this email.</p>
        </div>
    </body>
    </html>`;
        
    // Setup email data with QR code image
    const mailOptions = {
        from: '"Fitness Mobile 💪" <bodylifeapp@gmail.com>',
        to: email,
        subject: 'Verify your email',
        html: htmlContent
    };

    // Create transporter and send email
    const transporter = nodemailer.createTransport({
        port: 465,               // true for 465, false for other ports
        host: "smtp.gmail.com",
           auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_APP_PASSWORD,
             },
        secure: true,
    });

    transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.error(error.toString());
            return res.status(500).json({ error: 'Could not send email. 2FA not enabled.' });
        }

        res.status(200).json({ message: 'email sent' });
    });
}

module.exports = {sendEmail, setVerifyEmailToTrue}