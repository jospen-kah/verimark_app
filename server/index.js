const express = require('express');
const connectDB = require('./db');

const app = express();
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));


connectDB();
app.listen(3000, () => {
    console.log('Server  is running on port 3000');
})
connectDB();