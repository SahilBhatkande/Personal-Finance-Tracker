const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/personal-finance-tracker';
        await mongoose.connect(mongoURI)
        console.log('DB is connected')
    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.log('Please make sure MongoDB is running or set MONGO_URI in .env file');
        process.exit(1);
    }
}

module.exports = connectDB;