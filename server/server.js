const path = require('path');
const http = require('http');
const express = require('express');
const SocketIO = require('socket.io');

const publicPath = path.join(__dirname + '/../public');
const {generateMessage, generateLocationMessage} = require('./utils/message');
const port = process.env.PORT || 3000;
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

let app = express();
let server = http.createServer(app);
let io = SocketIO(server);

let users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New User Connected');

    socket.on('join', (params, callback) => {
        if(!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and Room Name are required');
        }

        socket.join(params.room);
        // socket.leave('Developers');
        users.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));

        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the Chat Room'));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} just joined`));

        callback();
    });

    socket.on('createMessage', (message, callback) => {
        console.log('createMessage', message);
        io.emit('newMessage', generateMessage(message.from, message.text));
        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude));
    });

    socket.on('disconnect', () => {
        let user = users.removeUser(socket.id);
        if(user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left the chat room`));
        }
    });
});

server.listen(port, () => {
    console.log(`Server is up and running on ${port}`);
});
