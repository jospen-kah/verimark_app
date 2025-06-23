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
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:5173', // Common Vite dev server port
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/face', faceRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/halls', hallRoutes); 
app.use('/api/courses', courseRoutes);
app.use('/api/user', userRoutes);

// Database connection and model loading
connectDB();
loadModels();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});