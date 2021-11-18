import NodeMediaServer from 'node-media-server';

export default function rtmpInit(userCollection) {
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
          if ('key' in args) {
                let username = getUserFromStreamPath(StreamPath);
                let streamKey = args.key

                userCollection.findOne({username: username, stream_key: streamKey}, function(err, res) {
                    if (err || res === null) {   
                        nms.getSession(id).reject();
                        console.log("stream session rejected for username=", username, "&key=", streamKey)
                    }
                });
          }
      });
      
      //event fires when stream ends
      nms.on('donePlay', (id, StreamPath, args) => {
          // onStreamEnd
          //console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
      });
}

export function getUserFromStreamPath(path) {
    let parts = path.split('/');
    return parts[parts.length - 1];
};

