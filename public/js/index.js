let socket = io();

socket.on('connect', function (){
    console.log('Connected to Server');
});

socket.on('disconnect', function (){
    console.log('Disconnected from Server')
});

socket.on('newMessage', function(message){
    console.log('newMessage', message);
    let li = jQuery('<li></li>');
    li.text(`${message.from}: ${message.text}`);

    jQuery('#messages').append(li);
});

socket.on('newLocationMessage', function(message) {
    let li = jQuery('<li></li>');
    let a = jQuery('<a target="_blank">My Current Location</a>');

    li.text(`${message.from}: `);
    a.attr('href', message.url);
    li.append(a);

    jQuery('#messages').append(li);
});

jQuery('#message-form').on('submit', function(e) {
    e.preventDefault();

    socket.emit('createMessage', {
        from: 'User',
        text: jQuery('[name=message]').val()
    }, function() {

    });
});

let locationButton = jQuery('#send-location');

locationButton.on('click', function() {
    if(!navigator.geolocation) {
        return alert('Geolocation not supported by your browser');
    }

    navigator.geolocation.getCurrentPosition(function(pos) {
        socket.emit('createLocationMessage', {
            latitude : pos.coords.latitude,
            longitude: pos.coords.longitude
        });
    }, function(err) {
        alert('Unable to fetch location');
    });
});