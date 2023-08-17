const { request, response } = require("express");
const jsonwebtoken = require('jsonwebtoken')
const User = require('../Feature/User/user_model')

const verifyToken = async (req = request, res = response, next) => {
    const {authorization} = req.headers
console.log(authorization)
    jsonwebtoken.verify(authorization, process.env.PUBLIC_SECRET_KEY, async (error, decoded) => {
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
            req.user = user
            next()
        } catch (error) {
            return res.status(401).json({
                message: error.message
            })            
        }
    })
}

module.exports = verifyToken