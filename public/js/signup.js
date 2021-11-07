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
    console.log("hello")
    //do clientside validation
    console.log(password.value)
    console.log(confirmPassword.value)
    if(password.value !== confirmPassword.value){
        statusMsg.innerText = "Error: passwords don't match"
        statusMsg.classList.add('failed');
    }
    else{
        let body = JSON.stringify({
            username: username.innerText,
            password: password.innerText,
        });
    
        fetch('https://cs326-zayin.herokuapp.com/signup', {method: "POST", body: body})
        .then(response => {
            return response.json()
        }).then(handleResponse)

        window.location.href = "/"
    }   
})