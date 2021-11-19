let username = document.getElementById('username');
let password = document.getElementById('password');
let loginBtn = document.getElementById('login-btn');
let statusMsg = document.getElementById('status-msg');

function handleResponse(response) {
    statusMsg.className = '';
    console.log(response)
    if (response.success) {
        //perform redirect
        window.location.replace(response.redirectUrl);
    } else {
        //display the error message
        statusMsg.innerText = response.error
        statusMsg.classList.add('failed');
    }
}

loginBtn.addEventListener('click', function() {
    //do clientside validation
    let body = JSON.stringify({
        username: username.value,
        password: password.value,
    });
    
    fetch(window.URL_BASE + '/login', {
        method: "POST", 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, 
        body: body})
        .then(response => {
            return response.json();
        }).then(function(response) {
            handleResponse(response)
        });
})