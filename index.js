// Primary File for the API

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const helpers = require ('./lib/helpers');


// Instantiate the HTTP server
const httpServer = http.createServer((req,res)=>{
  unifiedServer(req,res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, ()=>{
  console.log(`The server is listening on port ${config.httpPort}`);
});

// Instantiate the HTTPS server
let httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'certificate' : fs.readFileSync('./https/cert.pem'), 
};
const httpsServer = https.createServer(httpsServerOptions, (req,res)=>{
  unifiedServer(req,res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, ()=>{
  console.log(`The server is listening on port ${config.httpsPort}`);
});


// All the server logic for both the http and https servers
let unifiedServer = (req,res)=>{
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
    let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

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
const router = {
  'ping': handlers.ping,
  'hello' : handlers.hello,
  'users' : handlers.users,
  'tokens' : handlers.tokens,
  'checks' : handlers.checks
}