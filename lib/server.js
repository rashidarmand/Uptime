// Server related tasks

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require ('./helpers');
const path = require('path');


// Instantiate the server module object
const server = {};


// Instantiate the HTTP server
server.httpServer = http.createServer((req,res)=>{
  server.unifiedServer(req,res);
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
  'key' : fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  'certificate' : fs.readFileSync(path.join(__dirname, '/../https/cert.pem')) 
};
server.httpsServer = https.createServer(server.httpsServerOptions, (req,res)=>{
  server.unifiedServer(req,res);
});


// All the server logic for both the http and https servers
server.unifiedServer = (req,res)=>{
  // Get URL and parse It
  let parsedURL = url.parse(req.url,true);

  // Get the path from URL
  let path = parsedURL.pathname;
  let trimmedPath = path.replace(/^\/+|\/+$/g,'');

  // Get the query string as an object
  let queryStringObject = parsedURL.query;

  // Get the HTTP Method
  let method = req.method.toLowerCase();

  // Get the Headers as an object
  let headers = req.headers;

  // Get the payload (body), if any
  let decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data)=>{
    buffer += decoder.write(data);
  });
  req.on('end', ()=>{
    buffer += decoder.end();

    // Choose the handler this request should go to. If one is not found, use not found handler
    let chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    let data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : helpers.parseJsonToObject(buffer)
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload)=>{
      // Use the status code called back by the handler or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Use the payload calledback by the handler or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert the payload to a string
      let payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode);
      res.end(payloadString);


      // Log the request path
      console.log(`Returning this response:`, statusCode, payloadString);
    }); 

  }) 
};


// Defining a Request Router
server.router = {
  'ping': handlers.ping,
  'hello' : handlers.hello,
  'users' : handlers.users,
  'tokens' : handlers.tokens,
  'checks' : handlers.checks
}

// Init script
server.init = ()=>{
  // Start the HTTP server
  server.httpServer.listen(config.httpPort, ()=>{
    console.log(`The server is listening on port ${config.httpPort}`);
  });

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort, ()=>{
    console.log(`The server is listening on port ${config.httpsPort}`);
  });
}


// Export the module
module.exports = server;