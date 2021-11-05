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
const app = express();
const server = Http.createServer(app);
const httpPort = 3000;
const __filename = fileURLToPath(import.meta.url);
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile('views/category.html')
})


//user api
app.get('/user/new', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/signup.html'));
});

app.post('/user/new', (req, res) => {

});

app.get('/user/auth', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/login.html'));
});

app.get('/user/info', (req, res) => {
    
});

//stream api
app.post('/stream/update', (req, res) => {
    
});

app.get('/stream/categories', (req, res) => {

});

//sports api
app.get('/sports/get', (req, res) => {

});

app.get('/sports', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/sports.html'));
});

server.listen(httpPort, () => {
    console.log(`Example app listening at http://localhost:${httpPort}`)
})

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
