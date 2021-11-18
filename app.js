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
import expressSession from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';

dotenv.config() //load env variables

// Session configuration
const session = {
    secret : process.env.SECRET || 'SECRET', // set this encryption key in Heroku config (never in GitHub)!
    resave : false,
    saveUninitialized: false
};

//Passport config
const strategy = new LocalStrategy(
    async (username, password, done) => {
        const database = client.db("spazz");
        const user = database.collection("user");
        var result = null;
        try{
            result = await user.findOne({"username": username});
        } catch (e) {
            console.error(e);
            return done(null, false, { 'message' : 'Wrong username' });
        } finally{
            if(result != null && result.password == password){
                return done(null, username);
            }
            else{
                return done(null, false, { 'message' : 'Login failed' });
            }
        }
    });

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

app.use(expressSession(session));
passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

// Convert user object to a unique identifier.
passport.serializeUser((user, done) => {
    done(null, user);
});
// Convert a unique identifier to a user object.
passport.deserializeUser((uid, done) => {
    done(null, uid);
});


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


function checkLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
	// If we are authenticated, run the next route.
	next();
    } else {
	// Otherwise, redirect to the login page.
	res.redirect('/login');
    }
}

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

app.post('/login', passport.authenticate('local'),
    function(req, res) { //only runs if authentication passes
        res.json({
            success: true, //or false if failed
            error: faker.lorem.words(), //if failed fill this field with error msg to display
            redirectUrl: 'http://localhost:3000/sports'
        });
});

// Handle logging out (takes us back to the login page).
app.get('/logout', (req, res) => {
    req.logout(); // Logs us out!
    res.redirect('/login'); // back to login
});

app.get('/private',
	checkLoggedIn,
	(req, res) => {
	    res.send("hello world");
});

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
