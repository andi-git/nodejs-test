var http = require('http');

var EventEmitter = require('events').EventEmitter;
var logger = new EventEmitter();
logger.on('info', function (message) {
    console.log('INFO: ' + message);
});

var express = require('express');
var app = express();
app.get("/ping", function (request, response) {
    response.writeHead(200);
    response.write("OK");
    response.end();
});
app.get("/", function (request, response) {
    response.writeHead(200);
    response.write("Welcome to Node.js");
    response.end();
});
app.get("/hello/:username", function (request, response) {
    var username = request.params.username;
    logger.emit('info', 'say hello to ' + username);
    response.writeHead(200);
    response.write("Hello " + username + "!");
    response.end();
});

app.listen(8080);

// http.createServer(function (request, response) {
//     logger.emit('info', 'Request arrived: ');
//     response.writeHead(200);
//     response.write("Hello");
//     response.end();
// }).listen(8080);

console.log("listen on port 8080");
