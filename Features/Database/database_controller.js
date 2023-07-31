const mongoose = require('mongoose')

const connectDataBase = async (req, res) => {
    const databaseName = req.query.databaseName

    try {
        mongoose.set('strictQuery', true)
        
        await mongoose.connect('mongodb+srv://fitness:zawwox-3woMhy-boftap@cluster0.rnsby4u.mongodb.net/' + databaseName)
        
        res.json({
            connected: true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            connected: false
        })
    }
}

const disconnectDataBase = async (req, res) => {
    try {
        await mongoose.disconnect()
        
        res.json({
            disconnected: true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            disconnected: false
        })
    }
}

module.exports = { connectDataBase, disconnectDataBase }