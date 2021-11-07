let user = {};

getUserInfo();

async function getUserInfo() {
    const response = await fetch("https://cs326-zayin.herokuapp.com/user/info", {
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });

    user = await response.json();

    const userBox = document.getElementById("userInfo");

    userBox.innerHTML = "@" + user.username;
}