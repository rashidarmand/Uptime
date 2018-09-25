### Node.js HTTP/HTTPS API

No External Packages

Features:

- Parses Requests
- Parses HTTP Methods
- Parses Query Strings
- Parses Headers
- Parses Payload
- Routes Requests
- Returns JSON
- Handles Staging & Production Environment Differently
- HTTP and HTTPS server

### To Run

Either: 

```NODE_ENV=staging node index.js``` or
```NODE_ENV=production node index.js```

Both an HTTP & HTTPS server will run regardless of environment.

the `/hello` route will return a simple JSON object with a welcome message.