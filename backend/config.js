const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectToDB = async () => {
    try{
        const connection = await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
        console.log("connected to database");
    }
    catch(err) {
        console.log(err);
    }
}

module.exports = connectToDB;