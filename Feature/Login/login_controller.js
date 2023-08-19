const handleError = require("../../Common/error_response")
const User = require('../User/user_model')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const nodemailer = require('nodemailer');

// 2FA library
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { request, response } = require("express");

const accessTokenExpiration = 60 * 1
const refreshTokenExpiration = 60 * 3

const doLogin = async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    if (!email || !password) {
       return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE'
        }) 
    }

    const filter = {
        email
    }

    try {
        const user = await User.findOne(filter)
        if (!user) {
            return res.status(400).json({
                title: '_LOGIN_ERROR',
                message: '_WRONG_USER_PASSWORD'
            })
        }

        const isValid = bcrypt.compareSync(password, user.password)
        if (!isValid) {
            return res.status(400).json({
                title: '_LOGIN_ERROR',
                message: '_WRONG_USER_PASSWORD'
            })
        }


        if (user.twoFactorEnabled) {
            const tempToken = jsonwebtoken.sign({ _id: user._id, step: '2FA' }, 'TemporarySecret', { expiresIn: 60 * 5 });

            return res.json({
                twoFactorEnabled: true,
                tempToken,
                user,
                accessToken: '', //  not yet available because we need to finish auth
                accessTokenExpirationDateString: Date()
            })
        }

        const accessToken = jsonwebtoken.sign({ _id: user._id, name: user.firstName }, 'Authorization', { expiresIn: accessTokenExpiration })
        const refreshToken = jsonwebtoken.sign({ _id: user._id}, 'RefreshAuthorization', {expiresIn: refreshTokenExpiration })

        var currentDate = new Date(); // Get the current date and time
        var accessTokenExpirationDate = new Date(currentDate.getTime() + accessTokenExpiration * 1000)

        var refreshTokenExpirationDate = new Date(currentDate.getTime() + refreshTokenExpiration * 1000)

        res.json({
            user,
            accessToken,
            accessTokenExpirationDateString: accessTokenExpirationDate,
            tempToken: '',
            refreshToken,
            refreshTokenExpirationDateString: refreshTokenExpirationDate
        })

    } catch (error) {
        handleError(res, error)
    }
}

const enable2FA = async (req, res) => {
    const user = await User.findById(req.user._id); // Assuming user is authenticated and user ID is in req.user
    
    
    const appName = 'YourAppName'; // Replace this with your app's name
    const issuer = 'FitnessMobile'; // Replace this with your issuer (optional but recommended)
    const label = `${issuer}:${user.email}`; // Commonly used format with issuer and email
    const secret = speakeasy.generateSecret({
        name: label, // This sets the label in the OTP URL
        issuer: issuer // This sets the issuer in the OTP URL (optional but recommended)
    });

    user.twoFactorSecret = secret.base32;
    
    QRCode.toDataURL(secret.otpauth_url, async (err, data_url) => {
        if (err) {
            return res.status(500).json({ error: 'Could not generate QR code' });
        }

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2FA QR Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f3f4f6;
            color: #333;
            margin: 40px;
        }
        .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #4a5568;
        }
        img {
            border: 4px solid #4a5568;
            border-radius: 10px;
        }
        p {
            font-size: 18px;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>2FA QR Code</h1>
        <p>Scan the QR code below with your 2-factor authentication (2FA) app to enable 2FA for your account.</p>
        <img src="${data_url}" alt="2FA QR Code">
        <p>Your activation code: ${secret.base32}</p>
        <p>If you have any issues, please contact our support team.</p>
    </div>
</body>
</html>`;

        
        // Setup email data with QR code image
        const mailOptions = {
            from: '"Fitness Mobile 💪" <bodylifeapp@gmail.com>',
            to: "diegodavid@icloud.com",
            subject: 'Enable Two Factor Authentication',
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

            await user.save();


            // this is for sending the qr image as Data
            // Extract the base64 content and content type from the data URL
            const matches = data_url.match(/^data:(.+);base64,(.+)$/);
            if (matches.length !== 3) {
                res.status(500).send('Error processing QR code data');
                return;
            }

            const contentType = matches[1];
            const base64Data = matches[2];

            // Convert base64 to a buffer and send as response
            const imageBuffer = Buffer.from(base64Data, 'base64');
            const tempToken = jsonwebtoken.sign({ _id: user._id, step: '2FA' }, 'TemporarySecret', { expiresIn: 60 * 5 });

            const base64Image = imageBuffer.toString('base64');

            res.status(200).json({
                qrImage: base64Image,
                tempToken,
                activationCode: secret.base32
            });
        });
    });
}

// this required to be logged in, with jwt valid.
const disable2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user._id); // Assuming user is authenticated and user ID is in req.user

        // Check if the user has 2FA enabled
        if (!user.twoFactorEnabled) {
            return res.status(400).json({ message: '2FA is not enabled for this user' });
        }

        // Reset the 2FA fields
        user.twoFactorSecret = null;
        user.twoFactorEnabled = false;

        await user.save();

        res.status(200).json({ message: '2FA has been disabled' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while disabling 2FA', error });
    }
};

// this required to be logged in, with jwt valid.
const setTwoFactorEnabled = async (req, res) => {
    try {
        const user = await User.findById(req.user._id); // Assuming user is authenticated and user ID is in req.user

        // Check if the user has 2FA enabled
        if (!user.twoFactorSecret) {
            return res.status(400).json({ message: '2FA is not enabled for this user' });
        }

        // Reset the 2FA fields
        user.twoFactorEnabled = true;

        await user.save();

        res.status(200).json({ message: '2FA has been enabled' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while enabling 2FA', error });
    }
};

// don't need to be logged in.
const disable2FA_backend = async (req, res) => {
    try {
        const user = await User.findById(req.query._id); // Assuming user is authenticated and user ID is in req.user

        // Check if the user has 2FA enabled
        if (!user.twoFactorEnabled) {
            return res.status(400).json({ message: '2FA is not enabled for this user' });
        }

        // Reset the 2FA fields
        user.twoFactorSecret = null;
        user.twoFactorEnabled = false;

        await user.save();

        res.status(200).json({ message: '2FA has been disabled' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while disabling 2FA', error });
    }
};

const verify2FA = async (req, res) => {
    const tempToken = req.body.tempToken;
    const otpToken = req.body.otpToken;

    try {
        const decoded = jsonwebtoken.verify(tempToken, 'TemporarySecret');
        const user = await User.findById(decoded._id);

        if (!user || decoded.step !== '2FA') {
            return res.status(400).json({
                title: '_LOGIN_ERROR',
                message: '_INVALID_REQUEST'
            });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: otpToken
        });

        /* por ahora deshabilito el chequeo del codigo*/

        if (!verified) {
            return res.status(432).json({
                title: '_LOGIN_ERROR',
                message: '_INVALID_OTP'
            });
        }

        const accessToken = jsonwebtoken.sign({ _id: user._id, name: user.firstName }, 'Authorization', { expiresIn: accessTokenExpiration })

        var currentDate = new Date(); // Get the current date and time
        var accessTokenExpirationDate = new Date(currentDate.getTime() + accessTokenExpiration * 1000)

        res.json({
            user,
            accessToken,
            accessTokenExpirationDateString: accessTokenExpirationDate,
            tempToken: ''
        })
    } catch (error) {
        handleError(res, error);
    }
};

const verify2FAWithNoTempToken = async (req, res) => {
    const otpToken = req.body.otpToken;

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(400).json({
                title: '_LOGIN_ERROR',
                message: '_INVALID_REQUEST'
            });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: otpToken
        });

        /* por ahora deshabilito el chequeo del codigo*/

        if (!verified) {
            return res.status(432).json({
                title: '_LOGIN_ERROR',
                message: '_INVALID_OTP'
            });
        }

        const accessToken = jsonwebtoken.sign({ _id: user._id, name: user.firstName }, 'Authorization', { expiresIn: accessTokenExpiration })

        var currentDate = new Date(); // Get the current date and time
        var accessTokenExpirationDate = new Date(currentDate.getTime() + accessTokenExpiration * 1000)

        res.json({
            user,
            accessToken,
            accessTokenExpirationDateString: accessTokenExpirationDate,
        })
    } catch (error) {
        handleError(res, error);
    }
};

const refreshToken = (req = request, res=response) => {
    const authorization = req.headers.authorization
    jsonwebtoken.verify(authorization, 'RefreshAuthorization', (error, decode) => {
        if (error) {
            return res.status(401).json({
                message: error.message
            })
        }

        var accessToken = jsonwebtoken.sign({_id: decode._id}, 'Authorization', { expiresIn: accessTokenExpiration})

        var currentDate = new Date(); // Get the current date and time
        var accessTokenExpirationDate = new Date(currentDate.getTime() + accessTokenExpiration * 1000)

        res.json({
            accessToken,
            accessTokenExpirationDateString: accessTokenExpirationDate,
        })
    })
}

module.exports = verify2FA;


module.exports = { doLogin, enable2FA, verify2FA, disable2FA, disable2FA_backend, setTwoFactorEnabled, verify2FAWithNoTempToken, refreshToken }