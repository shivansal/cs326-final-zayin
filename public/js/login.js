let username = document.getElementById('username');
let password = document.getElementById('password');
let loginBtn = document.getElementById('login-btn');
let statusMsg = document.getElementById('status-msg');

function handleResponse(response) {
    statusMsg.className = '';
    if (response.status == 200) {
        //perform redirect
        window.location.replace(response.redirectUrl);
    } else {
        //display the error message
        statusMsg.innerText = 'Error: login failed'
        statusMsg.classList.add('failed');
    }
}

loginBtn.addEventListener('click', function() {
    //do clientside validation
    let body = JSON.stringify({
        username: username.value,
        password: password.value,
    });
    
    fetch('http://localhost:3000/login', {
        method: "POST", 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, 
        body: body}) //https://cs326-zayin.herokuapp.com/login
    .then(response => {
        return response
    }).then(handleResponse)
})