// Helpers for various tasks

// Depndencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');

// Container for all the helpers
let helpers = {};

// Create a SHA-256 hash
helpers.hash = (str)=>{
  if(typeof(str) == 'string' && str.length > 0){
    let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Parse a JSON string to an object in all casses without throwing an error
helpers.parseJsonToObject = (str)=>{
  try{
    let obj = JSON.parse(str);
    return obj;
  }catch(e){
    return {};
  }
}

// Create a string of random alpha numeric characters of a given length
helpers.createRandomString  = (strLength)=>{
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all the possible characters that could go into a string
    let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    let str = '';
    for(let i = 1; i <= strLength; i++){
      // Get a random character from the possible characters string
      let randomCharacter =  possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

      // Append this character to the final string
      str += randomCharacter;

    }
    // Return the final string
    return str;

  } else {
    return false;
  }
};

// Send and SMS message via Twilio
helpers.sendTwilioSms = (phone, msg, callback)=>{
  // Validate parameters
  phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
  msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
  if(phone && msg){
    // Configure the request payload to send to Twilio
    let payload = {
      'From' : config.twilio.fromPhone,
      'To' : '1' + phone,
      'Body' : msg
    };

    // Stringify the payload
    let stringPayload = querystring.stringify(payload);
    // Configure the request details 
    let requestDetails = {
      'protocol' : 'https:',
      'hostname' : 'api.twilio.com',
      'method' : 'POST',
      'path' : '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
      'auth' : config.twilio.accountSid + ':' + config.twilio.authToken,
      'headers' : {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length' : Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request object
    let req = https.request(requestDetails, (res)=>{
      // Grab the status of the sent request
      let status = res.statusCode;
      // Callback successfully if the request went through
      if(status == 200 || status == 201){
        callback(false);
      } else {
        callback('Status code returned was ' + status);
      }
    });

    // Bind to the error event so it doesnt get thrown
    req.on('error', (e)=>{
      callback(e);
    });

    // Add the payload to the request
    req.write(stringPayload);

    // End the request
    req.end();
    
  } else {
    callback('Given parameters were missing or invalid');
  }
};


// Export the module
module.exports = helpers;