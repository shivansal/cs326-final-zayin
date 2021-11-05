let username = document.getElementById('username');
let password = document.getElementById('password');
let loginBtn = document.getElementById('login-btn');
let statusMsg = document.getElementById('status-msg');

loginBtn.addEventListener('click', function() {
    //do clientside validation
    $.post('http://localhost:3000/login', {
        username: username.innerText, 
        password: password.innerText
    }).done((response) => {
        statusMsg.className = '';
        if (response.success) {
           //redirect??
           console.log('successfully logged in')
        } else {
            statusMsg.innerText = 'Error: ' + response.error 
            statusMsg.classList.add('failed');
        }
    });
})