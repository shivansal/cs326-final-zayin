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
        statusMsg.innerText = 'Error: ' + response.errorMsg
        statusMsg.classList.add('failed');
    }
}

signupBtn.addEventListener('click', function() {
    //do clientside validation
    if(password.value !== confirmPassword.value){
        statusMsg.innerText = "Error: passwords don't match"
        statusMsg.classList.add('failed');
    }
    else{
        let body = JSON.stringify({
            username: username.value,
            password: password.value,
        });
    
        fetch('http://localhost:3000/signup', { //https://cs326-zayin.herokuapp.com/signup
            method: "POST", 
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            }, 
            body: body}) 
        .then(response => {
            return response.json()
        }).then(handleResponse)
        // window.location.href = "/"
    }   
})