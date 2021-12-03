//https://external-preview.redd.it/f8lFTnZRu0UtxulCXCUhTsHMTBZRKU6X3Zj8ciG2IAU.jpg?auto=webp&s=60039b6c45e1320d503c21d9c3e47ff9cd058e46
let currentUserName = document.getElementById('current-username');
let currentTitle = document.getElementById('current-title');
let currentCategory = document.getElementById('current-category');
let streamKey = document.getElementById('stream-key');
let streamStatusMsg = document.getElementById('stream-status-msg');
let userStatusMsg = document.getElementById('user-status-msg');
let updateStreamBtn = document.getElementById('update-stream-btn');
let newTitle = document.getElementById('new-title');
let newCategory = document.getElementById('new-category');
let newStreamThumb = document.getElementById('new-stream-thumb');
let currentStreamThumb = document.getElementById('stream-thumb');
let currentProfilePic = document.getElementById('profile-picture');
let currentProfileUrl = document.getElementById('current-profileurl');
let newProfileUrl = document.getElementById('new-profileurl');
let updateUserBtn = document.getElementById('update-user-btn');
let currentTitleHelp = document.getElementById('currentTitleHelp');
let currentThumbHelp = document.getElementById('currentThumbHelp');
let currentCategoryHelp = document.getElementById('currentCategoryHelp');
let currentProfileUrlHelp = document.getElementById('currentProfileUrlHelp');
let streamLink = document.getElementById('stream-link');

console.log(newTitle)
console.log(newStreamThumb)
console.log(newCategory)

console.log(currentTitleHelp)
console.log(currentThumbHelp)
console.log(currentCategoryHelp);

loadSportsCategories();

async function loadSportsCategories() {
//<a class="dropdown-item" href="http://localhost:3000/user"></a></a>

    const response = await fetch(window.URL_BASE + '/sports/get', {
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        }
    });

    let sportsArray = await response.json();
    sportsArray = sportsArray.sports;
    console.log(sportsArray)

    for (const sport of sportsArray) {
        let option = document.createElement('option');
        option.innerText = sport.name;
        newCategory.appendChild(option);
    }
}

//handle the response by telling the user what happened
//and updating the title and category on screen
function handleUpdateStreamResponse(response, title, category, streamThumb) {
    console.log(response)
    streamStatusMsg.className = '';
    if (response.success) {
        streamStatusMsg.classList.add('success');
        streamStatusMsg.innerText = 'Successfully updated';
        currentTitle.innerText = title;
        currentCategory.innerText = category;
        currentStreamThumb.innerText = streamThumb;
        currentTitleHelp.innerText = "Current: " + title;
        currentThumbHelp.innerText = "Current: " + streamThumb;
        currentCategoryHelp.innerText = "Current: " + category;
    } else {
        streamStatusMsg.classList.add('failed');
        streamStatusMsg.innerText = 'Error: ' + response.error;
    }
}

function handleUpdateUserResponse(response, profilePic) {
    userStatusMsg.className = '';
    if (response.success) {
        userStatusMsg.classList.add('success');
        userStatusMsg.innerText = 'Successfully updated';
        currentProfileUrl.innerText = profilePic;
        currentProfilePic.src = profilePic;
        currentProfileUrlHelp.innerText = 'Current: ' + profilePic;
    } else {
        userStatusMsg.classList.add('failed');
        userStatusMsg.innerText = 'Error: ' + response.error;
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
    fetch(window.URL_BASE + '/stream/update', {method: 'POST', body: body, headers: headers}) //https://cs326-zayin.herokuapp.com/stream/update
    .then(response => {
        return response.json();
    }).then(function(response) {
        handleUpdateStreamResponse(response, title, category, streamThumb)
    });
});

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
    fetch(window.URL_BASE + '/user/update', {method: 'POST', body: body, headers: headers})
    .then(response => {
        return response.json();
    }).then(function(response) {
        handleUpdateUserResponse(response, profilePic)
    });

})

async function getUser() {
    let user = await fetch(window.URL_BASE + '/user/info');
    user = await user.json();

    return user;
}

async function getStream(username) {
    let body = JSON.stringify({
        username: username,
    });
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    console.log(body);

    let streamsRes = await fetch('/stream/get', {method: 'POST', body: body, headers: headers});
    streamsRes = await streamsRes.json();
    let streams = streamsRes.streams;

    return streams[0];
}

function renderUserInfo(user) {
    currentUserName.innerText = user.username
    streamLink.innerText = window.URL_BASE + '/live/' + user.username;
    currentProfileUrl.innerText = user.profilepic;
    currentProfilePic.src = user.profilepic;
    currentProfileUrlHelp.innerText = 'Current: ' + user.profilepic;
    streamKey.innerText = user.username + '?key=' + user.stream_key;
    streamLink.href = window.URL_BASE + '/live/' + user.username;
}

function renderStreamInfo(stream) {
    currentTitle.innerText = stream.title;
    currentTitleHelp.innerText = "Current: " + stream.title;
    currentCategory.innerText = stream.category;
    currentCategoryHelp.innerText = "Current: " + stream.category;
    currentStreamThumb.innerText = stream.thumbnail;
    currentThumbHelp.innerText = "Current: " + stream.thumbnail;
}

async function updateUserAndStream() {
    let user = await getUser();
    let stream = await getStream(user.username);

    console.log(stream)

    renderUserInfo(user);
    renderStreamInfo(stream);
}

updateUserAndStream();

