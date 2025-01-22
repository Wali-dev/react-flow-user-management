const mongoose = require("mongoose");
require('dotenv').config();

const URL = process.env.DATABASE_URL

module.exports.database = async () => {
    try {
        await mongoose.connect(URL);
        console.log("DB connected");
    } catch (error) {
        console.log(error)
    }

}