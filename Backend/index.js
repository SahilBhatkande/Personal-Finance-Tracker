const express = require('express')
const cors = require('cors')
require('dotenv').config();
const connectDB = require('./config/db')
const apiRoutes = require('./routes/api')

const app = express();

connectDB();

app.use(cors())
app.use(express.json())

app.use('/api' , apiRoutes);

const port = process.env.PORT || 5000;

app.listen(port , () => {
    console.log(`Server is running on port ${port}`)
})

