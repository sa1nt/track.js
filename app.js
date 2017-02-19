
var connect = require('connect');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var url = require('url');
var qs = require('querystring');
var http = require('http');

// __dirname <String> -- The directory name of the current module. 
var app = connect();

var userLocations = {};
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/location/clear', function(request, response){
	if (request.method === 'GET') {
		response.writeHead(200, {'Content-Type': 'text/plain'});

		var url_parts = url.parse(request.url, true);
		console.log('GET /clear request. Query: ', url_parts.query);
		// GET to /location/clear&uuid={uuid}
		//	will delete user with {uuid} from memory
		// GET to /location/clear 
		//	will delete all users from memory
		if (url_parts.query.uuid) {
			response.write('Deleted user ' + url_parts.query.uuid + '\n');
			delete userLocations[url_parts.query.uuid];
		} else {
			response.write('Deleted all ' + Object.keys(userLocations).length + '\n');
			userLocations = {};
		}

		// Send the response body as "Hello World"
		response.end('OK\n');
	}
});
app.use('/location', function(request, response) {
	if (request.method === "GET") {
//		console.log('GET /location request');
		response.writeHead(200, {
			"Content-Type": "application/json"
		});
		response.end(JSON.stringify(userLocations));
	}
	if (request.method === "POST") {
		console.log('POST /location request. Body: ', request.body);
		if (request.body.name && request.body.uuid && request.body.latitude && request.body.longtitude) {
			// if a request contains location info, then update userLocations Map 
			var userKey = request.body.uuid;
			userLocations[userKey] = {
				'name': request.body.name,
				'latitude': request.body.latitude,
				'longtitude': request.body.longtitude
			};
			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.end('OK\n');
		} else {
			response.write(400);
			response.end('POST /location request should be a JSON with "name", "uuid", "latitude" and "longtitude" elements');
		}
	}
});

var staticPath = '/'; 
app.use(staticPath, serveStatic(__dirname + staticPath)); 

// take PORT env var if available. Default to 8081 otherwise
const port = process.env.PORT ? process.env.PORT : 8081;

http.createServer(app).listen(port);

console.log('Server running on ' + port );
