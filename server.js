var http = require('http')
	, fs = require('fs')
	, path = require('path')
	, mime = require('mime')
	, cache = {};

function send404(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}

function sendFile(response, filePath, fileContents) {
	response.writeHead(200, {"content-type": mime.lookup(path.basename(filePath))} );
	response.end(fileContents);
}

function serveStatic (response, cache, absPath) {
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exits) {
			if (exits) {
				fs.readFile(absPath, function(err, data) {
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			} else {
				send404(response);
			}
		});
	}
}

var server = http.createServer(function(request, response) {
	var filePath = false;

	if (request.url === '/'){
		filePath = 'build/index.html';
	} else {
		filePath = 'build' + request.url;
	}

	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);
});

server.listen(80, function() {
	console.log("Server is listening on port 80.");
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);