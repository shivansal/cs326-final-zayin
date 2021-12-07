import { Server } from "socket.io";
import { getStreams } from "./stream.js";

const MAX_MSG_HISTORY = 250;

function getUserFromSocket(socket) {
    try {
        return socket.request.session.passport.user;
    } catch (e) { }

    return null;
}

async function addChatMsg(msg, senderUsername, streamUsername, streamCollection) {
    return streamCollection.updateOne({username: streamUsername}, {
        $push: {
            chat: {
                $each: [ {msg: msg, username: senderUsername} ],
                $slice: -MAX_MSG_HISTORY,
            }
        }
    });
}

async function incrementViewers(username, streamCollection, amount) {
    return streamCollection.updateOne({username: username}, {
        $inc: {
            viewers: amount
        }
    });
}

async function resetViewers(streamCollection) {
    return streamCollection.updateMany({}, {
        $set: {
            viewers: 0
        }
    });
}

export default async function chatInit(httpServer, sessionMiddleware, streamCollection) {
    await resetViewers(streamCollection);
    const io = new Server(httpServer, {});

    //create namespace
    const chatNamespace = io.of('/chat');
    chatNamespace.use(function (socket, next) {
        sessionMiddleware(socket.request, {}, next);
    });

    chatNamespace.on('connection', async (socket) => {
        let user = getUserFromSocket(socket);
        let streamerUserName = socket.handshake.query["streamer_username"] !== undefined ? socket.handshake.query["streamer_username"] : '';

        let streamResult = await getStreams(streamCollection, streamerUserName);
        if (!streamResult.success || streamResult.streams.length < 1) {
            socket.disconnect(); //stream doesnt exist
            return;
        }

        let streamDoc = streamResult.streams[0]; //only can be 1

        if (user) {
            console.log(user.username + " has joined", streamDoc.username + '\'s chat room');
        } else {
            console.log('GUEST has joined', streamDoc.username + '\'s chat room');
        }

        //increment viewers
        incrementViewers(streamerUserName, streamCollection, 1);

        //join chatroom
        let chatRoomId = '$chatRoom:' + streamDoc.username;
        socket.join(chatRoomId);

        //send the current messages
        socket.emit('loadMessages', streamDoc.chat);

        //if the user is authenticated
        if (user) {
            console.log('chat user:', user.username, ' is authenticated');
            //fires when this specific socket sends message
            socket.on('chatMessage', async (msgObj) => {
                chatNamespace.to(chatRoomId).emit('chatMessage', {
                    username: user.username,
                    msg: msgObj.msg,
                });

                await addChatMsg(msgObj.msg, user.username, streamerUserName, streamCollection);
            });
        }

        socket.on('disconnect', () => {
            //decrement viewers
            incrementViewers(streamerUserName, streamCollection, -1);
        });

        socket.on('getMessages', async () => {
            streamResult = await getStreams(streamCollection, streamerUserName);
            if (streamResult.success && streamResult.streams.length > 0) {
                streamDoc = streamResult.streams[0];
                socket.emit('loadMessage', streamDoc.chat);
            } else {
                socket.emit('loadMessage', []);
            }
        });
    });
}