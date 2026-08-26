const mongoose=require('mongoose');

const mongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connection Successful");
    } catch (error) {
        console.log("DB Connection Failed", error.message);
    }
};

module.exports = mongoDB;
