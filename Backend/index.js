const express = require('express')
const cors = require('cors')
require('dotenv').config();
const connectDB = require('./config/db')
const apiRoutes = require('./routes/api')
const plaidRoutes = require('./routes/plaid')

const app = express();

connectDB();

app.use(cors())
app.use(express.json())

app.use('/api' , apiRoutes);
app.use('/plaid', plaidRoutes);

const port = process.env.PORT || 3001;

app.listen(port , () => {
    console.log(`Server is running on port ${port}`)
})

