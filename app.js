'use strict';
import Path from 'path';
import Http from 'http'
import faker from 'faker';
import chatInit from './src/chat.js'
import rtmpInit from './src/rtmp.js';
import express from 'express';
import { fileURLToPath } from 'url';
import bodyParser from "body-parser";

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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//user api
app.get('/signup', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/signup.html'));
});

app.post('/signup', (req, res) => {
    //??? what does this return???
});

app.get('/login', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/login.html'));
});

app.post('/login', (req, res) => {
    //??? what does this return???
})

app.get('/user/info', (req, res) => {
    let fakeRes = {
        username: faker.name.firstName(),
        stream_key: faker.lorem.words(),
        stream_title: faker.lorem.words(),
        stream_category: faker.lerem.words(),
    }

    res.json(fakeRes);
});

app.get('/user', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/user.html'));
})

//stream api
app.post('/stream/update', (req, res) => {
    console.log(req.body.title)
    console.log(req.body.category)

    //verify title and category
    res.json({
        success: true //or false if failed
    });
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

app.get('/stream/browse', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/category.html'));
})

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

//setup chat
chatInit();

//setup rtmp/nms
rtmpInit();

server.listen(httpPort, () => {
    console.log(`App listening at http://localhost:${httpPort}`)
})