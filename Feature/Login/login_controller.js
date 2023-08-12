const handleError = require("../../Common/error_response")
const User = require('../User/user_model')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const nodemailer = require('nodemailer');

// 2FA library
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');


const doLogin = async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    if (!email || !password) {
        return res.status(400).json({
            title: '_LOGIN_ERROR',
            message: '_WRONG_USER_PASSWORD'
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
            const tempToken = jsonwebtoken.sign({ _id: user._id, step: '2FA' }, 'TemporarySecret', { expiresIn: 60 * 2 });

            return res.json({
                twoFactorEnabled: true,
                tempToken,
                user,
                token: '' //  not yet available because we need to finish auth
            })
        }

        const token = jsonwebtoken.sign({ _id: user._id, name: user.firstName }, 'Authorization', { expiresIn: 60 * 2 })

        res.json({
            user,
            token
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
    user.twoFactorEnabled = true;
    
    QRCode.toDataURL(secret.otpauth_url, async (err, data_url) => {
        if (err) {
            return res.status(500).json({ error: 'Could not generate QR code' });
        }
        
        const htmlContent = `<h1>2FA QR Code</h1><img src="${data_url}">`;
        
        // Setup email data with QR code image
        const mailOptions = {
            from: '"Fitness Mobile 💪" <bodylifeapp@gmail.com>',
            to: "diegodavid@icloud.com",
            subject: 'Enable 2FA for Your App Name',
            html: htmlContent
        };

        // Create transporter and send email
        const transporter = nodemailer.createTransport({
            port: 465,               // true for 465, false for other ports
            host: "smtp.gmail.com",
               auth: {
                    user: 'bodylifeapp@gmail.com',
                    pass: 'sqbz ewzk jjxx hckr',
                 },
            secure: true,
        });

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.error(error.toString());
                return res.status(500).json({ error: 'Could not send email. 2FA not enabled.' });
            }

            await user.save();
            res.status(200).json({ message: '2FA enabled, QR code sent to email' });
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

        if (!user || !user.twoFactorEnabled || decoded.step !== '2FA') {
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

        if (!verified) {
            return res.status(400).json({
                title: '_LOGIN_ERROR',
                message: '_INVALID_OTP'
            });
        }

        const jwtToken = jsonwebtoken.sign({ _id: user._id, name: user.firstName }, 'Authorization', { expiresIn: 60 * 2 });
        res.json({
            user,
            token: jwtToken
        });
    } catch (error) {
        handleError(res, error);
    }
};

module.exports = verify2FA;


module.exports = { doLogin, enable2FA, verify2FA, disable2FA, disable2FA_backend }