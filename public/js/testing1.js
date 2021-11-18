const username = getUsernameFromPath(window.location.href);
const streamPlayer = document.getElementById('stream-player');

let currentlyLive = false;
let flvPlayer = null;

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
    console.log(jsonResponse)
    next(jsonResponse && jsonResponse.streams[0].live);
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

function getUsernameFromPath(path) {
    let parts = path.split('/');
    return parts[parts.length - 1];
}

function handlePollResponse(isLive) {
    setLiveIndicator(isLive);
    if (isLive && !currentlyLive) {
        currentlyLive = true
        //flvPlayer.play();
    } else if (!isLive) {
        currentlyLive = false;
    }
}

window.onload = function() {
    setupPlayer()
    //poll right away
    pollStream(username, handlePollResponse);

    //Poll every 2 seconds to check for live
    setInterval(() => {
        pollStream(username, handlePollResponse);
    }, 2000);
}










