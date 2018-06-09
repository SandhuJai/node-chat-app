const path = require('path');
const http = require('http');
const express = require('express');
const publicPath = path.join(__dirname + '/../public');

const port = process.env.PORT || 3000;

const SocketIO = require('socket.io');

let app = express();
let server = http.createServer(app);
let io = SocketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New User Connected');

    socket.on('disconnecy', () => {
        console.log('Disconnected from the client');
    });
});

server.listen(port, () => {
    console.log(`Server is up and running on ${port}`);
});
