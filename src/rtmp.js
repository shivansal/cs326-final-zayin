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
          console.log(args)
          if ('streamkey' in args) {
                let username = getUserFromStreamPath(StreamPath);
                let streamKey = args.streamkey



                userCollection.findOne({username: username, stream_key: streamKey}, function(err, res) {
                    console.log(res);
                });

            
      
              /* 
              Reject if streamKey is invalid:
      
              let user = db.users.find({username:userName})
              if !user or user.streamKey !== streamKey
                  let session = nms.getSession(id);
                  session.reject()
              */
          }
      });
      
      //event fires when stream ends
      nms.on('donePlay', (id, StreamPath, args) => {
          // onStreamEnd
          console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
      });
}

export function getUserFromStreamPath(path) {
    let parts = path.split('/');
    return parts[parts.length - 1];
};

