const handleError = require("../../Common/error_response")
const User = require('../User/user_model')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')

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

        const token = jsonwebtoken.sign({ _id: user._id, name: user.firstName }, 'Authorization', { expiresIn: 60 * 2 })

        res.json({
            user,
            token
        })

    } catch (error) {
        handleError(res, error)
    }
}

module.exports = doLogin