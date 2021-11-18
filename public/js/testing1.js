
let liveUrl = 'http://localhost:8000/live/username.flv';
var xhr = new XMLHttpRequest();
xhr.open('GET', liveUrl, true);
xhr.onload = function (e) {
    console.log("yo");
    var mediaDataSource = JSON.parse(xhr.response);
    //flv_load_mds(mediaDataSource);
    console.log(mediaDataSource)
}
xhr.send();

/*
<script>
    if (flvjs.isSupported()) {
        var videoElement = document.getElementById('videoElement');
        var flvPlayer = flvjs.createPlayer({
            type: 'flv',
            url: 'http://localhost:8000/live/username.flv'
        });
        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
        flvPlayer.play();
    }
</script>

*/