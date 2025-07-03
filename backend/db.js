const mongoose = require('mongoose');

const mongoURI = "mongodb://localhost:27017/inotebook?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log(" Connected to Mongo Successfully");
    } catch (error) {
        console.error(" MongoDB connection failed:", error.message);
        process.exit(1); // Exit the process if unable to connect
    }
};

module.exports = connectToMongo;
