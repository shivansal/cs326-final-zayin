'use strict';
import Path from 'path';
import Http from 'http'
import faker from 'faker';
import chatInit from './src/chat.js'
import rtmpInit from './src/rtmp.js';
import express from 'express';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import * as mongodb from 'mongodb';
import * as dotenv from 'dotenv';
import * as expressSession from 'express-session';
import * as passport from 'passport';
import Strategy from 'passport-local';

dotenv.config() //load env variables

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
        viewers: faker.datatype.number(),
        image: faker.image.sports(),
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
        image: faker.image.sports(),
   }
}

const app = express();
const server = Http.createServer(app);
const httpPort = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
app.use(express.static('public'))

//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//set up mongodb connection

const uri = process.env.MONGO_URL;
const client = new mongodb.MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function listDatabases(client){
    var databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};
 
try {
    // Connect to the MongoDB cluster
    await client.connect();
    // Make the appropriate DB calls
    await listDatabases(client);
} catch (e) {
    console.error(e);
} 
// finally {
//     await client.close();
// }




//user api
app.get('/signup', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/signup.html'));
});

app.post('/signup', async (req, res) => {
    //do auth signup stuff here
    // console.log(req.body)
    const database = client.db("spazz");
    const user = database.collection("user");

    const doc = {
        username: req.body.username,
        password: req.body.password,
        stream_key: "",
        profilepic: ""
    }
    try{
        const result = await user.insertOne(doc);
    } catch (e) {
        console.error(e);
        res.json({
            success: false, //or false if failed
            error: faker.lorem.words(), //if failed fill this field with error msg to display
            redirectUrl: ''
        });
    } finally{
        res.json({
            success: true, //or false if failed
            error: faker.lorem.words(), //if failed fill this field with error msg to display
            redirectUrl: 'http://localhost:3000/sports'
        });
    }
});

app.get('/login', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/login.html'));
});

app.post('/login', async (req, res) => {
    //do auth login stuff here
    const database = client.db("spazz");
    const user = database.collection("user");
    var result = null;

    try{
        result = await user.findOne({"username": req.body.username});
    } catch (e) {
        console.error(e);
        res.json({
            success: false, //or false if failed
            error: "Username invalid", //if failed fill this field with error msg to display
            redirectUrl: ''
        });
    } finally{
        if(result != null && result.password == req.body.password){
            res.json({
                success: true,
                error: faker.lorem.words(), //if failed fill this field with error msg to display
                redirectUrl: 'http://localhost:3000/sports',
            });
        }
        else{
            res.json({
                success: false,
                error: "Login Failed", //if failed fill this field with error msg to display
                redirectUrl: 'http://localhost:3000/sports',
            });
        }
    }
})

app.get('/user/info', (req, res) => {

    let fakeRes = {
        username: faker.name.firstName(),
        password: faker.lorem.words(),
        stream_key: faker.lorem.words(),
        stream_title: faker.lorem.words(),
        stream_category: faker.lorem.words(),
        profilepic: faker.image.animals(),
        stream_thumbnail: faker.image.sports(),
    }

    res.json(fakeRes);
});

app.post('/user/update', (req, res) => {
    console.log(req.body);

    let fakeRes = {
        success: faker.datatype.boolean(),
        error: faker.lorem.words(),
    }

    res.json(fakeRes);
})

app.get('/user', (req, res) => {
    /* Confirm the user is authorized here
        If not we would normally redirect
        Otherwise render user.html
    */

    res.sendFile(Path.join(__filename, '../public/views/user.html'));
});

//stream api
app.post('/stream/update', (req, res) => {

    //verify title and category
    res.json({
        success: true //or false if failed
    });
});

app.post('/stream/get', (req, res) => {
    let fakeRes = {
        streams: [
           fakeStream(),
           fakeStream(),
           fakeStream(),
        ]
    };

    res.json(fakeRes);
});

app.get('/stream/browse', (req, res) => { // /stream/browse?category=basketball
    // let category = req.query["category"]
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

app.get('*',function (req, res) {
    res.redirect('/sports');
});

//setup chat
chatInit(server);

//setup rtmp/nms
rtmpInit();

server.listen(httpPort, () => {
    console.log(`App listening at http://localhost:${httpPort}`)
})
