/*
idea:
centralized tracking of people w. GPS-enabled phones through a webpage

server:
1. provides a basic index.html with
	a. JS to show a map
	b. JS to send current location to server
		periodically
		also, some name
			provided by user
			auto-generated
	c. the map shows locations of all users

client: 
1. periodically sends location to server
2. stays active when not in use
*/

var connect = require('connect');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var url = require('url');
var qs = require('querystring');
var http = require('http');

const port = 8081;

// __dirname <String> -- The directory name of the current module. 
var app = connect();

var userLocations = {};
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/location', function(request, response){
	console.log(request.body);
	if (request.method === 'GET') {
		response.writeHead(200, {'Content-Type': 'text/plain'});

		var url_parts = url.parse(request.url, true);
        console.log('Query: ', url_parts.query);
        if (url_parts.query.clear !== undefined) {
        	if (url_parts.query.uuid) {
        		response.write('Deleted user ' + url_parts.query.uuid + '\n');
        		delete userLocations[url_parts.query.uuid];
        	} else {
        		response.write('Deleted all ' + Object.keys(userLocations).length + '\n');
	        	userLocations = {};
	        }
        }

		// Send the response body as "Hello World"
		response.end('OK\n');
	}
	if (request.method === "POST") {
		if(request.body.name && request.body.latitude && request.body.longtitude) { 
			var userKey = request.body.name;

			var result = Object.assign({}, userLocations);
			delete result[userKey];

			userLocations[userKey] = {
				'latitude': request.body.latitude,
				'longtitude': request.body.longtitude
			};

			console.log(result);
			response.writeHead(200, {
		      "Content-Type": "application/json"
    		});
			response.end(JSON.stringify(result));
		}
/*
		var requestBody = '';
		request.on('data', function(data) {
			requestBody += data;
			if(requestBody.length > 1e7) {
				response.writeHead(413, 'Request Entity Too Large', {'Content-Type': 'text/html'});
				response.end('<!doctype html><html><head><title>413</title></head><body>413: Request Entity Too Large</body></html>');
			}
		});
*/
  	}
});


var staticPath = '/static'; 
app.use(staticPath, serveStatic(__dirname + staticPath)); 

http.createServer(app).listen(port);

console.log('Server running on ' + port );

/*
var http = require("http");

http.createServer(function (request, response) {
   // Send the HTTP header 
   // HTTP Status: 200 : OK
   // Content Type: text/plain
   response.writeHead(200, {'Content-Type': 'text/plain'});
   
   // Send the response body as "Hello World"
   response.end('Hello World\n');
}).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');
*/