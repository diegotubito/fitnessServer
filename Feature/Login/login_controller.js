const handleError = require("../../Common/error_response")
const User = require('../User/user_model')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')

const doLogin = async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    if (!email || !password) {
        return res.status(400).json({
            message: 'email and password is needed.'
        })
    }

    const filter = {
        email
    }

    try {
        const user = await User.findOne(filter)
        if (!user) {
            return res.status(400).json({
                message: 'email not found.'
            })    
        }

        const isValid = bcrypt.compareSync(password, user.password)
        if (!isValid) {
            return res.status(400).json({
                message: 'password is not correct'
            })
        }

        const token = jsonwebtoken.sign({ _id: user._id, name: user.firstName }, 'Authorization', { expiresIn: 60 * 5 })

        res.json({
            user,
            token
        })

    } catch (error) {
        handleError(res, error)
    }
}

module.exports = doLogin