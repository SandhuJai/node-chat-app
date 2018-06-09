const path = require('path');
const http = require('http');
const express = require('express');
const SocketIO = require('socket.io');

const publicPath = path.join(__dirname + '/../public');
const {generateMessage, generateLocationMessage} = require('./utils/message');
const port = process.env.PORT || 3000;

let app = express();
let server = http.createServer(app);
let io = SocketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New User Connected');

    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the Chat Room'));

    socket.broadcast.emit('newMessage', generateMessage('Admin', 'New User Joined'));

    socket.on('createMessage', (message, callback) => {
        console.log('createMessage', message);
        io.emit('newMessage', generateMessage(message.from, message.text));
        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from the client');
    });
});

server.listen(port, () => {
    console.log(`Server is up and running on ${port}`);
});
