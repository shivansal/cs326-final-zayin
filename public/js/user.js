let currentUserName = document.getElementById('current-username');
let currentTitle = document.getElementById('current-title');
let currentCategory = document.getElementById('current-category');
let streamKey = document.getElementById('stream-key');
let statusMsg = document.getElementById('status-msg');
let updateStreamBtn = document.getElementById('update-stream-btn');
let newTitle = document.getElementById('new-title');
let newCategory = document.getElementById('new-category');
let newStreamThumb = document.getElementById('new-stream-thumb');
let currentStreamThumb = document.getElementById('stream-thumb');
let currentProfilePic = document.getElementById('profile-picture');
let currentProfileUrl = document.getElementById('current-profileurl');
let newProfileUrl = document.getElementById('new-profileurl');
let updateUserBtn = document.getElementById('update-user-btn');

//handle the response by telling the user what happened
//and updating the title and category on screen
function handleUpdateStreamResponse(response, title, category, streamThumb) {
    console.log(response)
    statusMsg.className = '';
    if (response.success) {
        statusMsg.classList.add('success');
        statusMsg.innerText = 'Successfully updated';
        currentTitle.innerText = title;
        currentCategory.innerText = category;
        currentStreamThumb.innerText = streamThumb;
        console.log(streamThumb)
    } else {
        statusMsg.classList.add('failed');
        statusMsg.innerText = 'Error: ' + response.error;
    }
}

function handleUpdateUserResponse(response, profilePic) {
    statusMsg.className = '';
    if (response.success) {
        statusMsg.classList.add('success');
        statusMsg.innerText = 'Successfully updated';
        currentProfileUrl.innerText = profilePic;
        currentProfilePic.src = profilePic;
    } else {
        statusMsg.classList.add('failed');
        statusMsg.innerText = 'Error: ' + response.error;
    }
}   

updateStreamBtn.addEventListener('click', function() {
    //get the title and category to set
    let title =  (newTitle.value === '') ? currentTitle.innerText : newTitle.value;
    let category = (newCategory.value === '') ? currentCategory.innerText : newCategory.value;
    let streamThumb = (newStreamThumb.value === '') ? currentStreamThumb.innerText : newStreamThumb.value;
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    //build body
    let body = JSON.stringify({
        title: title,
        category: category,
        thumbnail: streamThumb
    });

    //send post to /stream/update endpoint
    fetch('http://localhost:3000/stream/update', {method: 'POST', body: body, headers: headers})
    .then(response => {
        return response.json();
    }).then(function(response) {
        handleUpdateStreamResponse(response, title, category, streamThumb)
    });

})

updateUserBtn.addEventListener('click', function() {
    //get the title and category to set
    let profilePic = (newProfileUrl.value === '') ? currentProfilePic.src : newProfileUrl.value;
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    //build body
    let body = JSON.stringify({
       profilepic: profilePic
    });

    


    //send post to /stream/update endpoint
    fetch('https://cs326-zayin.herokuapp.com/user/update', {method: 'POST', body: body, headers: headers})
    .then(response => {
        return response.json();
    }).then(function(response) {
        handleUpdateUserResponse(response, profilePic)
    });

})

function getUserInfo() {
    //send post to /stream/update endpoint
    fetch('https://cs326-zayin.herokuapp.com/user/info')
    .then(response => {
        return response.json();
    }).then(function(response) {
        currentUserName.innerText = response.username
        currentProfileUrl.innerText = response.profilepic;
        currentProfilePic.src = response.profilepic;
        currentTitle.innerText = response.stream_title;
        currentCategory.innerText = response.stream_category;
        currentStreamThumb.innerText = response.stream_thumbnail;
    });



}

window.onload = getUserInfo;