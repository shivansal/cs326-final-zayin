let categoryTitle = document.getElementById('category-header-title');

let params = (new URL(document.location)).searchParams;
let category = params.get("category");

categoryTitle.innerHTML = category

let streams = document.getElementById('streams');
let viewers = document.getElementById('viewers');

function handleResponse(response) {
    let score = 0
    for (const x of response.streams) { 

        const parentdiv = document.createElement('div');
        parentdiv.classList.add('col-xl-3');
        parentdiv.classList.add('col-md-6');

        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.classList.add('thumbnail-container');
        //  thumbnailDiv.addEventListener('click', () => {
        //      window.location.href = "/stream/browse?category=" + sportsArray[i].name;
        //  });

        const streamImage = document.createElement('img');
        streamImage.classList.add('stream-thumbnail');
        streamImage.setAttribute('height', '250');
        streamImage.setAttribute('alt', 'stream thumbnail');
        streamImage.setAttribute('src', x.image);

        const streamInfo = document.createElement('div');
        streamInfo.classList.add('stream-info-container');

        const profile = document.createElement('a');
        profile.classList.add('stream-link');

        const profileImage = document.createElement('img');
        profileImage.classList.add('stream-profile-icon');
        profileImage.setAttribute('height', '40');
        profileImage.setAttribute('alt', 'profile thumbnail');
        profileImage.setAttribute('src', x.image);

        const streamName = document.createElement('a');
        streamName.classList.add('stream-link');

        const name = document.createElement('p');
        name.classList.add('stream-data');
        name.innerHTML = x.title

        const username = document.createElement('p');
        username.classList.add('stream-data');
        username.innerHTML = x.username

        const viewers = document.createElement('p');
        viewers.classList.add('stream-data');
        viewers.innerHTML = "Viewers: " + x.viewers

        streamName.appendChild(name)
        profile.appendChild(profileImage)
        streamInfo.appendChild(profile)
        streamInfo.appendChild(streamName)
        streamInfo.appendChild(name)
        streamInfo.appendChild(username)
        streamInfo.appendChild(viewers)

        thumbnailDiv.appendChild(streamImage);
        thumbnailDiv.appendChild(streamInfo);

        parentdiv.appendChild(thumbnailDiv)
        streams.appendChild(parentdiv)
        
        score += x.viewers
    }
    viewers.innerHTML = "Total viewers: " + score

}


let body = JSON.stringify({
    category: category,
    live: true
});

fetch('https://cs326-zayin.herokuapp.com/stream/get', {method: "POST", body: body})
.then(response => {
    return response.json()
}).then(handleResponse)            
