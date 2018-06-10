let socket = io();

function scrollToBottom() {
    let messages = jQuery('#messages');
    let newMessage = messages.children('li:last-child');
    let clientHeight = messages.prop('clientHeight');
    let scrollTop = messages.prop('scrollTop');
    let scrollHeight = messages.prop('scrollHeight');
    let newMessageHeight = newMessage.innerHeight();
    let lastMessageHeight = newMessage.prev().innerHeight();

    if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}

socket.on('connect', function (){
    let params = jQuery.deparam(window.location.search);

    socket.emit('join', params, function(err) {
        if(err) {
            alert(err);
            window.location.href = '/';
        }else {
            console.log('No Error');
        }
    });
});

socket.on('disconnect', function (){
    console.log('Disconnected from Server');
});

socket.on('updateUserList', function(users) {
    var ol = jQuery('<ol></ol>');

    users.forEach(function(user) {
        ol.append(jQuery('<li></li>').text(user));
    });

    jQuery('#users').html(ol);
});

socket.on('newMessage', function(message){
    let formattedTime = moment(message.createdAt).format('h:mm a');
    let template = jQuery('#message-template').html();
    let html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });

    jQuery('#messages').append(html);
    scrollToBottom();
});

socket.on('newLocationMessage', function(message) {
    let formattedTime = moment(message.createdAt).format('h:mm a');
    let template = jQuery('#location-message-template').html();
    let html = Mustache.render(template, {
        from: message.from,
        createdAt: formattedTime,
        url: message.url
    });

    jQuery('#messages').append(html);
    scrollToBottom();
});

jQuery('#message-form').on('submit', function(e) {
    e.preventDefault();

    let messageTextBox = jQuery('[name=message]');

    socket.emit('createMessage', {
        text: messageTextBox.val()
    }, function() {
        messageTextBox.val('');
    });
});

let locationButton = jQuery('#send-location');
locationButton.on('click', function() {
    if(!navigator.geolocation) {
        return alert('Geolocation not supported by your browser');
    }

    locationButton.attr('disabled', 'disabled').text('Sending Location....');

    navigator.geolocation.getCurrentPosition(function(pos) {
        locationButton.removeAttr('disabled');
        locationButton.text('Share Location');
        socket.emit('createLocationMessage', {
            latitude : pos.coords.latitude,
            longitude: pos.coords.longitude
        });
    }, function(err) {
        locationButton.removeAttr('disabled');
        alert('Unable to fetch location');
    });
});