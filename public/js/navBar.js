getUserInfo();
loadBrowseDropDown();
const userBox = document.getElementById("userInfo");
const profilePic = document.getElementById("profilePic");

async function getUserInfo() {
    //https://cs326-zayin.herokuapp.com/user/info
    const response = await fetch(window.URL_BASE + "/user/info", {
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Credentials': 'same-origin'
        }
    });

    let user = await response.json();
    if (user.success) {
        userBox.innerHTML = "@" + user.username;
        profilePic.setAttribute("src", user.profilepic);
        profilePic.setAttribute("height", "50px");
        profilePic.setAttribute("width", "50px");
        document.getElementById('signin-btn').remove();
        document.getElementById('userInfo').classList.remove('hidden');
    } else {
        userBox.innerHtml = '';
    }



}

async function loadBrowseDropDown() {
    //<a class="dropdown-item" href="http://localhost:3000/user"></a></a>
    let browseDropDown = document.getElementById('browse-dropdown');


    const response = await fetch(window.URL_BASE + "/sports/get", {
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        }
    });

    let sportsArray = await response.json();
    sportsArray = sportsArray.sports;
    console.log(sportsArray)

    for (const sport of sportsArray) {
        let link = document.createElement('a');
        link.classList.add('dropdown-item');
        link.href = window.URL_BASE + '/stream/browse?category=' + sport.name;
        link.innerText = sport.name;
        browseDropDown.appendChild(link);
    }

}