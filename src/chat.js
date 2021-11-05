import { Server } from "socket.io";

export default function chatInit(httpServer) {
    const io = new Server(httpServer, {});
    
    //create namespace
    const chatNamespace = io.of('/chat');
    chatNamespace.on('connection', (socket) => {
        let streamerName = socket.handshake.query['streamer_name']

        //this object would be acquired from db.Users.find({username: streamer_name})
        let user = {
            username: "blah"
        }

        //streamer_name must match User.username
        if (streamerName === user.username) {
            //add socket to chatroom
            socket.join(user.username) 

            socket.on('chatMessage', (msg) => {
                //username of the sender, we get this from session storage possibly
                let senderName = faker.name.findName();
                chatNamespace.to(nameInDb).emit('chatMessage', {message: msg, sender: senderName})
                
                /*
                    Lookup stream in DB,
                    Add {message: msg, sender: senderName} to stream.chat
                */
            });
            
            socket.on('disconnect', () => {
                /*
                    Lookup stream in DB,
                    Decrement viewers
                */
            })
    }

    console.log("chat initalized");
})


}