// Primary File for the API

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');

// Declare the app
const app = {};

// Initialize the app
app.init = ()=>{
  // Start the server
  server.init();

  // Start the workers
  workers.init();
};

// Execute
app.init();

// Export the app
module.exports = app;