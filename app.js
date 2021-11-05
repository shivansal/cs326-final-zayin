'use strict';
import Path from 'path';
import Http from 'http'
import faker from 'faker';
import chatInit from './src/chat.js'
import rtmpInit from './src/rtmp.js';
import express from 'express';
import { fileURLToPath } from 'url';

/*
express/webserver stuff
*/

//just for returning fake data
function fakeStream() {
    return {
        username: faker.name.firstName(),
        title: faker.lorem.sentence(),
        category: faker.lorem.word(),
        live: true,
        chat: [
            {username: faker.name.firstName(), msg: faker.lorem.sentence()},
            {username: faker.name.firstName(), msg: faker.lorem.sentence()},
            {username: faker.name.firstName(), msg: faker.lorem.sentence()}
        ]
    }
}

function fakeSport() {
    return {
        name: faker.lorem.words(),
        viewers: faker.datatype.number(),
   }
}


const app = express();
const server = Http.createServer(app);
const httpPort = 3000;
const __filename = fileURLToPath(import.meta.url);
app.use(express.static('public'))

//user api
app.get('/user/new', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/signup.html'));
});

app.post('/user/new', (req, res) => {
    //??? what does this return???
});

app.get('/user/auth', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/login.html'));
});

app.post('/usrer/auth', (req, res) => {
    //??? what does this return???
})

app.get('/user/info', (req, res) => {
    let fakeRes = {
        username: faker.name.firstName(),
        stream_key: faker.lorem.words(),
    }

    res.json(fakeRes);
});

//stream api
app.post('/stream/update', (req, res) => {
    res.sendStatus(200);
});

app.get('/stream/categories', (req, res) => {
    let fakeRes = {
        streams: [
           fakeStream(),
           fakeStream(),
           fakeStream(),
        ]
    };

    res.json(fakeRes);
});

//sports api
app.get('/sports/get', (req, res) => {
    let fakeRes = {
        sports: [
            fakeSport(),
            fakeSport(),
            fakeSport()
        ]
    };

    res.json(fakeRes);
});

app.get('/sports', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/sports.html'));
});

//live api
app.get('/live/:username', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/stream.html'));
});

//other
app.get('/categories/:category', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/category.html'));
})

//setup chat
chatInit();

//setup rtmp/nms
rtmpInit();

server.listen(httpPort, () => {
    console.log(`App listening at http://localhost:${httpPort}`)
})