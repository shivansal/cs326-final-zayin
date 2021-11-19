getUserInfo();
loadBrowseDropDown();
const userBox = document.getElementById("userInfo");

async function getUserInfo() {
    //https://cs326-zayin.herokuapp.com/user/info
    const response = await fetch("http://localhost:3000/user/info", {
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Credentials': 'same-origin'
        }
    });

    let user = await response.json();
    if (user.success) {
        userBox.innerHTML = "@" + user.username;
        document.getElementById('signin-btn').remove();
        document.getElementById('userInfo').classList.remove('hidden');
    } else {
        userBox.innerHtml = '';
    }

    
    
}

async function loadBrowseDropDown() {
    //<a class="dropdown-item" href="http://localhost:3000/user"></a></a>
    let browseDropDown = document.getElementById('browse-dropdown');
    

    const response = await fetch("http://localhost:3000/sports/get", {
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
        link.href = 'http://localhost:3000/stream/browse?category=' + sport.name;
        link.innerText = sport.name;
        browseDropDown.appendChild(link);
    }

}