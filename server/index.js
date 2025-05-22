const express = require('express');
const connectDB = require('./db');
const instructorRoutes = require('./routes/instructorRoutes');


const app = express();
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/instructors', instructorRoutes);



connectDB();
app.listen(3000, () => {
    console.log('Server  is running on port 3000');
})