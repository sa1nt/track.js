
var connect = require('connect');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var url = require('url');
var qs = require('querystring');
var http = require('http');

// __dirname <String> -- The directory name of the current module. 
var app = connect();

var userLocations = {};
var pointLocations = {};

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
	// get locations of all users
	if (request.method === "GET") {
		response.writeHead(200, {
			"Content-Type": "application/json"
		});
		response.end(JSON.stringify(userLocations));
	}
	// update userLocations Map 
	if (request.method === "POST") {
		console.log('POST /location request. Body: ', request.body);
		// note that request.body.name is not necessary
		if (request.body.uuid && request.body.latitude && request.body.longtitude) {
			var userName = request.body.name || '';
			var userKey = request.body.uuid;
			userLocations[userKey] = {
				'name': userName,
				'latitude': request.body.latitude,
				'longtitude': request.body.longtitude
			};
			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.end('OK\n');
		} else {
			response.writeHead(400);
			response.end('POST /location request should be a JSON with "name", "uuid", "latitude" and "longtitude" elements');
		}
	}
});

app.use('/point/clear', function(request, response){
	if (request.method === 'GET') {
		response.writeHead(200, {'Content-Type': 'text/plain'});

		var url_parts = url.parse(request.url, true);
		console.log('GET /point/clear request. Query: ', url_parts.query);
		// GET to /point/clear?uuid={uuid}
		//	will delete point with {uuid} from memory
		// GET to /point/clear
		//	will delete all points from memory
		if (url_parts.query.uuid) {
			response.write('Deleted point ' + url_parts.query.uuid + '\n');
			pointLocations[url_parts.query.uuid]['latitude'] = -1;
			pointLocations[url_parts.query.uuid]['longtitude'] = -1;
//			delete pointLocations[url_parts.query.uuid];
		} else {
			response.write('Deleted all ' + Object.keys(pointLocations).length + '\n');
			for (var pointUuid in pointLocations) {
				if (pointLocations.hasOwnProperty(pointUuid)) {
					pointLocations[pointUuid]['latitude'] = -1;
					pointLocations[pointUuid]['longtitude'] = -1;
				}
			}
		}

		// Send the response body as "Hello World"
		response.end('OK\n');
	}
});
app.use('/point', function(request, response) {
	if (request.method === "GET") {
		response.writeHead(200, {
			"Content-Type": "application/json"
		});
		response.end(JSON.stringify(pointLocations));
	}
	if (request.method === "POST") {
		console.log('POST /point request. Body: ', request.body);
		if (request.body.uuid && request.body.latitude && request.body.longtitude) {
			// if a request contains location info, then update userLocations Map 
			var pointKey = request.body.uuid;
			pointLocations[pointKey] = {
//				'name': request.body.name,
				'latitude': request.body.latitude,
				'longtitude': request.body.longtitude
			};
			response.writeHead(200, {'Content-Type': 'text/plain'});
			response.end('OK\n');
		} else {
			response.writeHead(400);
			response.end('POST /location request should be a JSON with "uuid", "latitude" and "longtitude" elements');
		}
	}
});

var staticPath = '/'; 
app.use(staticPath, serveStatic(__dirname + staticPath)); 

// take PORT env var if available. Default to 8081 otherwise
const port = process.env.PORT ? process.env.PORT : 8081;

http.createServer(app).listen(port);

console.log('Server running on ' + port );
