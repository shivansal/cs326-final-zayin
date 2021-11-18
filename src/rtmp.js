import NodeMediaServer from 'node-media-server';

export default function rtmpInit(userCollection, streamCollection) {
    const config = {
        rtmp: {
            port: 1935,
            chunk_size: 60000,
            gop_cache: true,
            ping: 30,
            ping_timeout: 60
        },
        http: {
            port: 8000,
            allow_origin: '*'
        }
    };

    //start the rmtp server and websockets
    var nms = new NodeMediaServer(config)
    nms.run();

    //event fires when a user attempts to start a stream
    nms.on('prePublish', (id, StreamPath, args) => {
        let session = nms.getSession(id);
        if ('key' in args) {
            let username = getUserFromStreamPath(StreamPath);
            let streamKey = args.key

            userCollection.findOne({ username: username, stream_key: streamKey }, function (err, res) {
                if (err || res === null) {
                    session.reject();
                    console.log("stream session rejected for username=" + username + "&key=" + streamKey)
                } else {
                    streamCollection.updateOne({ username: username }, { $set: { live: true } });
                    console.log("stream session permitted for username=" + username + "&key=" + streamKey)
                }
            });
        } else {
            console.log("stream session rejected for username=", username, "&key=", undefined)
            session.reject();
        }
    });

    //FIRED WHEN STREAM ENDS
    nms.on('donePublish', (id, StreamPath, args) => {
        let username = getUserFromStreamPath(StreamPath);
        streamCollection.updateOne({ username: username }, { $set: { live: false } });
    });
}

export function getUserFromStreamPath(path) {
    let parts = path.split('/');
    return parts[parts.length - 1];
};

