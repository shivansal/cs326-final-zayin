let username = document.getElementById('username');
let password = document.getElementById('password');
let confirmPassword = document.getElementById('confirm-password');
let signupBtn = document.getElementById('signup-btn');
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

signupBtn.addEventListener('click', function() {
    //do clientside validation

    if(password.localeCompare(confirmPassword) != 0){
        statusMsg.innerText = "Error: passwords don't match"
        statusMsg.classList.add('failed');
    }
    else{
        let body = JSON.stringify({
            username: username.innerText,
            password: password.innerText,
        });
    
        fetch('http://localhost:3000/signup', {method: "POST", body: body})
        .then(response => {
            return response.json()
        }).then(handleResponse)
    }   
})