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
		// react only if field 'name' exists in request and isn't empty
		if (request.body.name && request.body.uuid) {
			var result = Object.assign({}, userLocations);
			// if a request contains location info, then update userLocations Map 
			//	and exclude this user's info from response
			// otherwise, return location info for all users
			if(request.body.latitude && request.body.longtitude) { 
				var userKey = request.body.uuid;
				userLocations[userKey] = {
					'name': request.body.name,
					'latitude': request.body.latitude,
					'longtitude': request.body.longtitude
				};

				delete result[userKey];
			}
			console.log(result);
			response.writeHead(200, {
		      "Content-Type": "application/json"
			});
			response.end(JSON.stringify(result));
		}
  	}
});


var staticPath = '/'; 
app.use(staticPath, serveStatic(__dirname + staticPath)); 

http.createServer(app).listen(port);

console.log('Server running on ' + port );
