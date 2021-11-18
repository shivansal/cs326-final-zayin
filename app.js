'use strict';
import Path from 'path';
import Http from 'http'
import faker from 'faker';
import chatInit from './src/chat.js'
import rtmpInit from './src/rtmp.js';
import express from 'express';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import dotenv from 'dotenv'
import expressSession from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';

import { generateStreamKey, newUser } from './src/user.js';
import {newStream} from './src/stream.js';
import { mongoInit } from './src/mongo.js';

dotenv.config();

let client = null;
let userCollection = null;
let streamCollection = null;

mongoInit(process.env.MONGO_URL, (stuff) => {
    client = stuff.client;
    userCollection = stuff.userCollection;
    streamCollection = stuff.streamCollection;
    rtmpInit(userCollection);
});

async function listDatabases(){
    var databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}




// Session configuration
const session = {
    secret : process.env.SECRET || 'SECRET', // set this encryption key in Heroku config (never in GitHub)!
    resave : false,
    saveUninitialized: false
};

//Passport config
const strategy = new LocalStrategy(
    async (username, password, done) => {
        userCollection.findOne({'username': username}, (err, user) => {
            if (err) { return done(err); }
            
            if (!user) {
                return done(null, false, {message: "Wrong username"});
            }

            if (password !== user.password) {
                return done(null, false, {mesagge: "Wrong password"});
            }

            return done(null, user);
        });
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
    const username = req.body.username;
    const password = req.body.password;
    const streamKey = "nothing";
    const profilePic = "default";

    //validate username, password
    //generate stream key, set default profile

    const newUserDoc = newUser(username, password, generateStreamKey(), profilePic)
    let success = true;
    let errorMsg = '';
    let redirectUrl = 'http://localhost:3000/login';

    //insert user
    let mongoRes = await userCollection.insertOne(newUserDoc);

    if (mongoRes === null || !mongoRes.acknowledged) {
        success = false;
        errorMsg = 'Signup failed';
    } else {
        //insert stream
        let newStreamDoc = newStream(username, username + '\'s livestream', 'default', false, 0, [])
        mongoRes = await streamCollection.insertOne(newStreamDoc);

        if (mongoRes === null || !mongoRes.acknowledged) {
            success = false;
            errorMsg = 'Stream creation failed';
        }
    }

    res.json({
        success: success,
        errorMsg: errorMsg,
        redirectUrl: redirectUrl
    });
});

app.get('/login', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/login.html'));
});

app.post('/login', passport.authenticate('local', {
    successRedirect: "/loginsuccess",
    failureRedirect: "/loginfailure"
}));

app.get('/loginsuccess', (req, res) => {
    res.json({
        success: true,
        error: '',
        redirectUrl: 'http://localhost:3000/sports'
    });
})

app.get('/loginfailure', (req, res) => {
    res.json({
        success: false,
        error: 'Login failed: invalid username or password',
        redirectUrl: ''
    });
})

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
    if (req.isAuthenticated()) {
        let fakeRes = {
            success: true,
            username: faker.name.firstName(),
            password: faker.lorem.words(),
            stream_key: faker.lorem.words(),
            stream_title: faker.lorem.words(),
            stream_category: faker.lorem.words(),
            profilepic: faker.image.animals(),
            stream_thumbnail: faker.image.sports(),
        }

        res.json(fakeRes);
    } else {
        res.json({
            success: false,
        });
    }
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

server.listen(httpPort, () => {
    console.log(`App listening at http://localhost:${httpPort}`)
})
