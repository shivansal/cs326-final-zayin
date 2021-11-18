let user = {};

getUserInfo();

async function getUserInfo() {
    //https://cs326-zayin.herokuapp.com/user/info
    const response = await fetch("http://localhost:3000/user/info", {
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });

    user = await response.json();

    const userBox = document.getElementById("userInfo");

    userBox.innerHTML = "@" + user.username;
}