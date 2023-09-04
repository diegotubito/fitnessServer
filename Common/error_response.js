const handleError = (res, error) => {
    console.log(error.message)
    return res.status(500).json({
        title: '_500_SERVER_TITLE',
        message: error.message
    })
}

const sendEmail = () => {
    
}

module.exports = handleError