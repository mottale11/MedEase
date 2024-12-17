// import
const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./auth');

const app = express();

// set-up middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '../medease-frontend')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API routes
app.use('/api/patient', authRoutes);
app.use('/api/doctor', authRoutes);
app.use('/api/admin', authRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../medease-frontend/html', 'index.html'));
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
