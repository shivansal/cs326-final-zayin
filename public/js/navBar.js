let user = {};

getUserInfo();

async function getUserInfo() {
    //https://cs326-zayin.herokuapp.com/user/info
    const response = await fetch("http://localhost:3000/user/info", {
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Credentials': 'same-origin'
        }
    });

    user = await response.json();
    if (user.success) {
        const userBox = document.getElementById("userInfo");
        userBox.innerHTML = "@" + user.username;
        document.getElementById('signin-btn').remove();
        document.getElementById('userInfo').classList.remove('hidden');
    } else {
        userBox.innerHtml = '';
    }

    
    
}