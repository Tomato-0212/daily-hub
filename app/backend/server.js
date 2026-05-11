const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const prometheus = require('prom-client');
const expressPrometheus = require('express-prometheus-middleware');

const tasksRouter = require('./routes/tasks');
const pool = require('./db');

const app = express();
const port = 30003;
const BASE_URL = `http://143.198.215.184:${port}`;

// ==================== Prometheus Metrics ====================
// setup Prometheus metrics
prometheus.collectDefaultMetrics();

app.use(expressPrometheus({
    metricsPath: '/metrics',
    collectDefaultMetrics: true,
    requestDurationBuckets: [0.1, 0.5, 1, 2], // Customize buckets as needed
    requestLengthBuckets: [512, 1024, 5120, 10240],
    responseLengthBuckets: [512, 1024, 5120, 10240],
}));

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

// Metrics endpoint (handled by express-prometheus-middleware)
app.get('/metrics', (req, res) => {
    res.set('Content-Type', prometheus.register.contentType);
    res.end(prometheus.register.metrics());
});

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
    console.log(`✓ Server is running on ${BASE_URL}`);
    console.log(`✓ API Documentation:`);
    console.log(`  GET    ${BASE_URL}/api/tasks`);
    console.log(`  POST   ${BASE_URL}/api/tasks`);
    console.log(`  PUT    ${BASE_URL}/api/tasks/:id`);
    console.log(`  DELETE ${BASE_URL}/api/tasks/:id`);
    console.log('======== Metrics Endpoint ========');
    console.log(`  GET    ${BASE_URL}/metrics`);
});