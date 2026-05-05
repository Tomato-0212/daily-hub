const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const tasksRouter = require('./routes/tasks');
const pool = require('./db');

const app = express();
const port = 3003;

// ==================== Middleware ====================
// Enable CORS for all routes
app.use(morgan('dev'));
app.use(cors({
    origin: '*', // Allow all origins (ปรับเปลี่ยนตามต้องการ)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// ==================== Routes ====================
// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'Daily Hub API is running',
        status: 'OK'
    });
});

// Tasks API routes
app.use('/api/tasks', tasksRouter);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// ==================== Server ====================
app.listen(port, () => {
    console.log(`✓ Server is running on http://localhost:${port}`);
    console.log(`✓ API Documentation:`);
    console.log(`  GET    http://localhost:${port}/api/tasks`);
    console.log(`  POST   http://localhost:${port}/api/tasks`);
    console.log(`  PUT    http://localhost:${port}/api/tasks/:id`);
    console.log(`  DELETE http://localhost:${port}/api/tasks/:id`);
});