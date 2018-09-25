// Create and export configuration variables

// Container for all the environments
let environments = {};

// Staging (default) environment
environments.staging = {
  'httpPort' : 3000,
  'httpsPort' : 3001,
  'envName' : 'staging'
};

// Production environment
environments.production = {
  'httpPort' : 5000,
  'httpsPort' : 5001,
  'envName' : 'production'
};

// Define which environment was passed as a command line argument
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that current environment exists in the environments object. If not, default to staging environment
let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
