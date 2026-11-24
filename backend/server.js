require('dotenv').config();
require('./config/db.js');

const express = require('express');
const cors = require('cors');
const pinoHTTP = require('pino-http');

const logger = require('./logger.js');
const authRoutes = require('./routes/authRoutes.js');
const noteRoutes = require('./routes/notesRoutes.js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(pinoHTTP({ logger }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes); // Removed the trailing slash here

// 404 Handler (For routes that don't exist)
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    logger.error(`Global Error: ${err.message}`);
    res.status(500).json({ error: "Something went wrong!" });
});

module.exports = app;

if (require.main === module) {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        logger.info(`Server is Running on port ${port}`);
    });
}