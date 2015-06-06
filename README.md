# vr-server
Websocket server for multiplayer VR game. Forwards events sent by connected clients to all other connected clients

# How to start the server
1. Install npm and node
2. Run `npm install` in the root project directory(directory with the `package.json` file)
3. Run server with `node index.js`

The server listens for websocket connections on port 5000

### Message Format

#### Player Update
After connecting to the server, clients will receive events from other connected clients in the following format:

`{
  "player": 0,
  "event": "update",
  "data": ...
}`

Where `"player"` specifies a unique ID of the client sending the message and `"data"` is the payload sent from the client.

#### Player Disconnect
When a player disconnects, all other clients will receive the following message

`{
  "player": 0,
  "event": "disconnect"
}`
