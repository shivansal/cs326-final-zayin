let chatBox = document.getElementById('chat-box');
let sendBtn = document.getElementById('send-btn');
const username = getUsernameFromPath(window.location.href);
const streamPlayer = document.getElementById('stream-player');
let currentlyLive = false;
let flvPlayer = null;
let socket = null;


function getUsernameFromPath(path) {
    let parts = path.split('/');
    return parts[parts.length - 1];
}

function updateStreamData(viewers, title) {
    document.getElementById('current-viewers').innerText = viewers;
    document.getElementById('stream-title').innerText = title;
}

function addChatMsg(senderUsername, message) {
    /*
    <div class="message-container">
        <span class="chat-username">@username: </span>
        <span class="chat-message">asdas </span>
    </div> 
    */

    let shouldScroll = chatBox.scrollTop + chatBox.clientHeight === chatBox.scrollHeight;

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
    newUsername.innerText = '@' + senderUsername + ': ';
    newMsg.innerText = message;

    chatBox.append(newChatContainer)

    if (shouldScroll) {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function chatConnect() {
    socket = io('http://localhost:3000/chat', {
        query: {
            'streamer_username': username
        }
    });
}

function clearChat() {
    chatBox.innerHTML = '';
}

//fetch the chat log and display it
function loadChatMessages(messageObjs) {   
    clearChat();
    messageObjs.forEach(messageObj => {
        addChatMsg(messageObj.username, messageObj.msg)
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

async function pollStream(username, next) {
    let body = JSON.stringify({
        username: username
    });

    let response = await fetch('http://localhost:3000/stream/get', { //https://cs326-zayin.herokuapp.com/stream/get
        method: "POST", 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, 
        body: body
    }) 

    let jsonResponse = await response.json();
    console.log('viewers', jsonResponse.streams[0].viewers)

    if (jsonResponse) {
        next(jsonResponse.streams[0]);
    } else {
        next(null);
    }
}

function setupPlayer() {
    flvPlayer = flvjs.createPlayer({
        type: 'flv',
        url: 'http://localhost:8000/live/' + username + '.flv'
    });
    flvPlayer.attachMediaElement(streamPlayer);
    flvPlayer.load();
    flvPlayer.play();
}

function setLiveIndicator(live) {
    let color = 'red';
    let text = 'NOT LIVE'
    if (live) {
        color = 'green';
        text = 'LIVE';
    }

    let liveIndicator = document.getElementById('live-indicator');
    liveIndicator.classList.value = '';

    liveIndicator.classList.add('stream-data-' + color);
    liveIndicator.innerText = text;
}

function handlePollResponse(stream) {
    let isLive = false;
    if (stream) {
        isLive = stream.live;
        updateStreamData(stream.viewers, stream.title)
    }

    setLiveIndicator(isLive);

    if (isLive && !currentlyLive) {
        currentlyLive = true
        //flvPlayer.play();
    } else if (!isLive) {
        currentlyLive = false;
    }
}

window.onload = function() {
    chatConnect();

    socket.on('loadMessages', (messageObjs) => {
        loadChatMessages(messageObjs);
    });

    socket.emit('getMessages');
    socket.on('chatMessage', onChatMessage);
    
    sendBtn.addEventListener('click', onSendClicked);
    document.addEventListener('keypress', function(e) {
        if (e.code === 'Enter') {
            e.preventDefault();
            onSendClicked();
        }
            
    });
    setupPlayer()
    //poll right away
    pollStream(username, handlePollResponse);

    //Poll every 2 seconds to check for live
    setInterval(() => {
        pollStream(username, handlePollResponse);
    }, 2000);
}









