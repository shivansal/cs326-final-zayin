let currentUserName = document.getElementById('current-username');
let currentTitle = document.getElementById('current-title');
let currentCategory = document.getElementById('current-category');
let streamKey = document.getElementById('stream-key');
let statusMsg = document.getElementById('status-msg');
let updateBtn = document.getElementById('update-btn');
let newTitle = document.getElementById('new-title');
let newCategory = document.getElementById('new-category');

//handle the response by telling the user what happened
//and updating the title and category on screen
function handleResponse(response, title, category) {
    console.log(response)
    statusMsg.className = '';
    if (response.success) {
        statusMsg.classList.add('success');
        statusMsg.innerText = 'Successfully updated';
        currentTitle.innerText = title;
        currentCategory.innerText = category;
    } else {
        statusMsg.classList.add('failed');
        statusMsg.innerText = 'Error: ' + response.error;
    }
}

updateBtn.addEventListener('click', function() {
    //get the title and category to set
    let title =  (newTitle.value === '') ? currentTitle.innerText : newTitle.value;
    let category = (newCategory.value === '') ? currentCategory.innerText : newCategory.value;

    //build body
    let body = JSON.stringify({
        title: title,
        category: category
    });

    //send post to /stream/update endpoint
    fetch('http://localhost:3000/stream/update', {method: 'POST', body: body})
    .then(response => {
        return response.json();
    }).then(function(response) {
        handleResponse(response, title, category)
    });
})