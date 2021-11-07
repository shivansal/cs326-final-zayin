let chatBox = document.getElementById('chat-box');
let sendBtn = document.getElementById('send-btn');

let parts = window.location.href.split('/');
let streamerName = parts[parts.length - 1];

let socket = io('/chat', {
    query: {
        'streamer_name': streamerName
    }
});

function addChatMsg(username, message) {
    /*
    <div class="message-container">
        <span class="chat-username">@username: </span>
        <span class="chat-message">asdas </span>
    </div> 
    */

    //construct new chat element
    let newChatContainer = document.createElement('div');
    let newUsername = document.createElement('span');
    let newMsg = document.createElement('span');

    newChatContainer.classList.add('message-container');
    newUsername.classList.add('chat-username');
    newMsg.classList.add('chat-message');

    newChatContainer.append(newUsername);
    newChatContainer.append(newMsg);

    //set contents
    newUsername.innerText = '@' + username + ': ';
    newMsg.innerText = message;

    chatBox.append(newChatContainer)
}

//fetch the chat log and display it
function loadChatMessages() {
    let body = JSON.stringify({
        username: streamerName
    });
    
    fetch('https://cs326-zayin.herokuapp.com/stream/get', {method: "POST", body: body})
    .then(response => {
        return response.json()
    }).then(function(response) {
        response.streams[0].chat.forEach(msgPair => {
            addChatMsg(msgPair.username, msgPair.msg)
        });
    });
}

function onSendClicked() {
    let chatInput = document.getElementById('chat-input');
    let message = chatInput.value;

    if (message !== '') {
        //fire the chatMessage event
        socket.emit('chatMessage', {
            msg: message
        });

        chatInput.value = '';
    }
}

//will fire when message recieved
function onChatMessage(msgPair) {
    addChatMsg(msgPair.username, msgPair.msg);
}


window.onload = function() {
    loadChatMessages();
    socket.on('chatMessage', onChatMessage);
    sendBtn.addEventListener('click', onSendClicked);
    document.addEventListener('keypress', function(e) {
        if (e.code === 'Enter') {
            e.preventDefault();
            onSendClicked();
        }
            
    });
}


