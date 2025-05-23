const express = require('express');
const connectDB = require('./db');
const instructorRoutes = require('./routes/instructorRoutes');
const faceRoutes = require('./routes/faceRoutes');
const { loadModels } = require('./services/face.service');


const app = express();
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/instructors', instructorRoutes);
app.use('/api/face', faceRoutes);



connectDB();
loadModels();

app.listen(3000, () => {
    console.log('Server  is running on port 3000');
})