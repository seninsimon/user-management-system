const mongoose = require('mongoose')


const dbConnection = async () => {
    try {

        await mongoose.connect('mongodb://localhost:27017/adminpaneldb')
        console.log("connected to database");

    } catch (error) {
        console.log("connection Problem ..... ! error : ", error)
    }
}


module.exports = dbConnection
