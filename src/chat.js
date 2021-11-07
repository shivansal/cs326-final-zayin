import faker from 'faker';
import { Server } from "socket.io";

export default function chatInit(httpServer) {
    const io = new Server(httpServer, {});
    
    //create namespace
    const chatNamespace = io.of('/chat');
    chatNamespace.on('connection', (socket) => {
            //socket.handshake.query["streamer_name"] use this to verify

            //need to do some auth here also
            //cant chat unless authorized but can still see messages

            socket.on('chatMessage', (msg) => {
                //we would actually emit to an entire room of sockets
                //but this is just a dummy endpoint right now so it doesnt matter
               socket.emit('chatMessage', { 
                   username: faker.name.firstName(),
                   msg: faker.lorem.words(),
               });
            });

            socket.on('disconnect', () => {
                //decrement viewers somehow
            });
        
    });
}