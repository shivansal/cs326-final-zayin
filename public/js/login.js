let username = document.getElementById('username');
let password = document.getElementById('password');
let loginBtn = document.getElementById('login-btn');
let statusMsg = document.getElementById('status-msg');

function handleResponse(response) {
    statusMsg.className = '';
    if (response.success) {
        //perform redirect
        window.location.replace(response.redirectUrl);
    } else {
        //display the error message
        statusMsg.innerText = 'Error: ' + response.error 
        statusMsg.classList.add('failed');
    }
}

loginBtn.addEventListener('click', function() {
    //do clientside validation

    let body = JSON.stringify({
        username: username.innerText,
        password: password.innerText,
    });

    fetch('http://localhost:3000/login', {method: "POST", body: body})
    .then(response => {
        return response.json()
    }).then(handleResponse)
})