#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var _ = require('underscore')

//
// Configurations
//
var PORT = 5000

//
// Create and start http server
//
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);

    // We're only handling websockets, so return 404 when we receive http request
    response.writeHead(404);
    response.end();
});

server.listen(PORT, function() {
    console.log((new Date()) + ' Server is listening on port ' + PORT);
});


//
// Create websocket server
// 
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: true
});

// Generates an incrementing ID whenever called
var genID = function() {
  var counter = 0;
  return function() {
    return counter++;
  }
}();

// connection ID to connection
OpenConnections = {};

wsServer.on('connect', function(connection) {

    // Give this socket an ID and add it to our collection of open connections
    var socketID = genID();
    OpenConnections[socketID] = connection;
    console.log('Player ' + socketID + ' connected');

    connection.on('message', function(message) {
      // Can't handle binary data
      if (message.type !== 'utf8') {
        console.log('Can only handle utf8 data');
        return;
      }

      console.log('Received Message: ' + message.utf8Data);

      // Forward message to all clients except this one
      _.each(OpenConnections, function(conn, id) {
        if (id != socketID) {
          var msg = {
            "player": socketID,
            "event": "update",
            "data": message.utf8Data
          };
          conn.sendUTF(JSON.stringify(msg));
        }
      });
    });

    connection.on('close', function(reasonCode, description) {
      console.log('Player ' + socketID + ' disconnected.');

      // Remove from our collection of open connections
      delete OpenConnections[socketID]

      // Tell all other clients that a player left
      _.each(OpenConnections, function(conn, id) {
        var msg = {
          "player": socketID,
          "event": "disconnect"
        };
        conn.sendUTF(JSON.stringify(msg));
      });
    });

});
