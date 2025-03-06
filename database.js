const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    if (mongoose.connection.readyState !== 0) {
        console.log('MongoDB already connected.');
        return; 
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Atlas Connected...');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
