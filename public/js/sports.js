let sportsArray = [];
const sportsListHtml = document.getElementById("sportsList");

getAndRenderSports();

async function getAndRenderSports() {
    const response = await fetch("https://cs326-zayin.herokuapp.com/sports/get", {
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });
    sportsArray = await response.json();
    sportsArray = sportsArray.sports;
    console.log(sportsArray);
    for (let i = 0; i < sportsArray.length; i++) {
        const sportsDiv = document.createElement('div');
        sportsDiv.classList.add('col-xl-3');
        sportsDiv.classList.add('col-md-6');

        const link = document.createElement('a');
        link.setAttribute('href', 'http://www.google.com')

        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.classList.add('thumbnail-container');
        thumbnailDiv.addEventListener('click', () => {
            window.location.href = "/stream/browse?category=" + sportsArray[i].name;
        });

        const sportsImage = document.createElement('img');
        sportsImage.classList.add('stream-thumbnail');
        sportsImage.setAttribute('height', '250');
        sportsImage.setAttribute('alt', 'stream thumbnail');
        sportsImage.setAttribute('src', sportsArray[i].image);

        const sportsInfo = document.createElement('div');
        sportsInfo.classList.add('stream-info-container');

        const streamName = document.createElement('div');
        streamName.classList.add('stream-data');
        streamName.classList.add('category-name');
        streamName.innerHTML = sportsArray[i].name;

        sportsInfo.appendChild(streamName);
        thumbnailDiv.appendChild(sportsImage);
        thumbnailDiv.appendChild(sportsInfo);
        sportsDiv.appendChild(thumbnailDiv);
        sportsListHtml.appendChild(sportsDiv);
    }
}