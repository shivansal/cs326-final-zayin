let user = {};

getUserInfo();

async function getUserInfo() {
    const response = await fetch("http://localhost:3000/user/info", {
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });

    user = await response.json();

    const userBox = document.getElementById("userInfo");

    userBox.innerHTML = "@" + user.username;
}