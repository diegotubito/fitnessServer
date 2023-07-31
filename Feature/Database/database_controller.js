
const mongoose = require('mongoose')

const connectDataBase = async () => {
    try {
        mongoose.set('strictQuery', true)
        
        await mongoose.connect('mongodb+srv://fitness:zawwox-3woMhy-boftap@cluster0.rnsby4u.mongodb.net/fitness')
        console.log('connected database')
    
    } catch (error) {
        console.log(error)
        throw new Error('Error connected DB')
    }
}

module.exports = { connectDataBase }