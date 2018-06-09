let socket = io();

socket.on('connect', function (){
    console.log('Connected to Server');
});

socket.on('disconnect', function (){
    console.log('Disconnected from Server')
});

socket.emit('createMessage', {
    from: 'Jaikirat',
    text: 'Yup, that works for me'
});

socket.on('newMessage', function(message){
    console.log('newMessage', message);
});