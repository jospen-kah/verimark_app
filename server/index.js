const express = require('express');
const connectDB = require('./db');
const instructorRoutes = require('./routes/instructorRoutes');
const faceRoutes = require('./routes/faceRoutes');
const { loadModels } = require('./services/face.service');
const attendanceRoutes = require('./routes/attendanceRoutes');
const hallRoutes = require('./routes/hallRoute');
const courseRoutes = require('./routes/courseRoutes')
const userRoutes = require('./routes/useRoutes');
const authRoutes = require('./routes/authRoutes');


const app = express();
app.use(express.json());

app.use('/api/auth',authRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/face', faceRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/user', userRoutes);



connectDB();
loadModels();

app.listen(3000, () => {
    console.log('Server  is running on port 3000');
})