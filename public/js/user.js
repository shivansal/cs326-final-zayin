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


console.log(newTitle)
console.log(newStreamThumb)
console.log(newCategory)

console.log(currentTitleHelp)
console.log(currentThumbHelp)
console.log(currentCategoryHelp);

loadSportsCategories();

async function loadSportsCategories() {
//<a class="dropdown-item" href="http://localhost:3000/user"></a></a>

    const response = await fetch("http://localhost:3000/sports/get", {
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
        currentThumbHelp.innerText = "Current: " + category;
        currentCategoryHelp.innerText = "Current: " + streamThumb;
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
    fetch('http://localhost:3000/stream/update', {method: 'POST', body: body, headers: headers}) //https://cs326-zayin.herokuapp.com/stream/update
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
    fetch('http://localhost:3000/user/update', {method: 'POST', body: body, headers: headers})
    .then(response => {
        return response.json();
    }).then(function(response) {
        handleUpdateUserResponse(response, profilePic)
    });

})

function getUserInfo() {
    //send post to /stream/update endpoint
    fetch('http://localhost:3000/user/info') //https://cs326-zayin.herokuapp.com/user/info
    .then(response => {
        return response.json();
    }).then(function(response) {
        currentUserName.innerText = response.username
        currentProfileUrl.innerText = response.profilepic;
        currentProfilePic.src = response.profilepic;
        currentTitle.innerText = response.stream_title;
        currentCategory.innerText = response.stream_category;
        currentStreamThumb.innerText = response.stream_thumbnail;
        streamKey.innerText = response.username + '?key=' + response.stream_key;
        currentTitleHelp.innerText = "Current: " + response.stream_title;
        currentThumbHelp.innerText = "Current: " + response.stream_thumbnail;
        currentCategoryHelp.innerText = "Current: " + response.stream_category;

    });

    

}

window.onload = getUserInfo;