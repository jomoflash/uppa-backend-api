const express = require('express');
const colors = require('colors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env var
dotenv.config({path: './config/config.env'});

// load DB
connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port: ${process.env.PORT}`
      .yellow.bold
  );
});

// handle unhandleRejection
process.on('unhandledRejection', (err, promise) => {
  console.error(err.message);
  server.close(() => process.exit(1));
});
