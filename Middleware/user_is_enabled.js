const handleError = require('../Common/error_response')
const User = require('../Feature/User/user_model')

const isUserEnabled = async (req, res, next) => {
    const _id = req.body.user

    if (!_id) {
        return res.status(400).json({
            title: '_400_ERROR_TITLE',
            message: '_400_ERROR_MESSAGE_MIDDLEWARE'
        })
    }

    try {
        const user = await User.findById(_id)
        if (!user) {
            return res.status(432).json({
                title: '_432_USER_NOT_EXIST_TITLE',
                message: '_432_USER_NOT_EXIST_MESSAGE'
            })
        }
    
        if (!user.isEnabled) {
            return res.status(432).json({
                title: '_432_USER_NOT_ENABLED_TITLE',
                message: '_432_USER_NOT_ENABLED_MESSAGE'
            })
        }
    
        next()
    } catch (error) {
        handleError(res, error)
    }
}

module.exports = isUserEnabled