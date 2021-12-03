'use strict';
import Path from 'path';
import Http, { get } from 'http'
import chatInit from './src/chat.js'
import rtmpInit from './src/rtmp.js';
import express from 'express';
import crypto from 'crypto';
import bodyParser from 'body-parser';
import dotenv from 'dotenv'
import expressSession from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import { fileURLToPath } from 'url';
import { mongoInit } from './src/mongo.js';
import {checkLoggedIn, signUp} from './src/auth.js';
import { getAllUserInfo, getSafeUserInfo, updateUser } from './src/user.js';
import { getStreams, updateStream } from './src/stream.js';
import { isValidCategory } from './src/sport.js';

dotenv.config();

let client = null;
let userCollection = null;
let streamCollection = null;
let sportCollection = null;

mongoInit(process.env.MONGO_URL, (stuff) => {
    client = stuff.client;
    userCollection = stuff.userCollection;
    streamCollection = stuff.streamCollection;
    sportCollection = stuff.sportCollection;
    rtmpInit(userCollection, streamCollection);
    chatInit(server, sessionMiddleware, streamCollection);
});

// Session configuration
const session = {
    secret : process.env.SECRET || 'SECRET', // set this encryption key in Heroku config (never in GitHub)!
    resave : false,
    saveUninitialized: false
};
let sessionMiddleware = expressSession(session);

//Passport config
const strategy = new LocalStrategy(
    async (username, password, done) => {
        userCollection.findOne({'username': username}, (err, user) => {
            if (err) { return done(err); }
            
            if (!user) {
                return done(null, false, {message: "Wrong username"});
            }
            let salt = user.salt
            let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);

            if (hash !== user.hash) {
                return done(null, false, {mesagge: "Wrong password"});
            }

            return done(null, user);
        });
});

/*
express/webserver stuff
*/

const app = express();
const server = Http.createServer(app);
const httpPort = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
app.use(express.static('public'))

app.use(sessionMiddleware);
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

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//user api
app.get('/signup', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/signup.html'));
});

app.post('/signup', async (req, res) => {
    //do auth signup stuff here
    const username = req.body.username;
    const password = req.body.password;

    let resultObj = await signUp(username, password, userCollection, streamCollection);
    res.json(resultObj);
});

app.get('/404', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/404.html'));
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

app.get('/user/info', async (req, res) => {
    let result = {success: false};
    if (req.query.username) {
        result = await getSafeUserInfo(req.query.username, userCollection);
    } else if (req.isAuthenticated()) {  
        result = await getAllUserInfo(req.user.username, userCollection);
    }

    res.json(result);
});

app.post('/user/update', async (req, res) => {
    let result = {success: false, error: 'User not authenticated'};
    if (req.isAuthenticated()) {
        let profilePic = req.body.profilepic !== undefined ? req.body.profilepic : req.user.profilepic;
        result = await updateUser(req.user.username, profilePic, userCollection);
    }

    res.json(result);
})

app.get('/user', checkLoggedIn, (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/user.html'));
});

//stream api
app.post('/stream/update', async (req, res) => {
    let response = {success: false, error: 'Invalid category'};
    if (req.isAuthenticated()) {
        let username = req.user.username;
        let currentStream = await getStreams(streamCollection, username);
        let category = req.body.category !== undefined ? (req.body.category).trim().toLowerCase() : currentStream.category;
        let title = req.body.title !== undefined ? req.body.title : currentStream.title;
        let thumbnail = req.body.thumbnail !== undefined ? req.body.thumbnail : currentStream.thumbnail;

        let isValidSport = await isValidCategory(category, sportCollection);

        if (isValidSport) {
            response = await updateStream(username, title, category, thumbnail, streamCollection)
        }
    }

    res.json(response);
});

app.post('/stream/get', async (req, res) => {
    //{$exists: true}: matches anything
    let username = req.body.username;
    let category = req.body.category;
    let live = req.body.live;

    let result = await getStreams(streamCollection, username, category, live);

    console.log(username, category, live)
    //console.log(result);

    res.json(result);
});

app.get('/stream/browse', (req, res) => { // /stream/browse?category=basketball
    // let category = req.query["category"]
    res.sendFile(Path.join(__filename, '../public/views/category.html'));
})

//sports api
app.get('/sports/get', async (req, res) => {
    let sports = await sportCollection.find().toArray();

    if (sports) {
        res.json({
            sports: sports
        });
    } else {
        res.json({
            sports: []
        });
    }
});

app.get('/sports', (req, res) => {
    res.sendFile(Path.join(__filename, '../public/views/sports.html'));
});

//live api
app.get('/live/:username', async (req, res) => {
    let username = req.params.username
    let mongoRes = await userCollection.findOne({'username': username})
    if(mongoRes != null){
        res.sendFile(Path.join(__filename, '../public/views/stream.html'));
    }
    else{
        res.sendFile(Path.join(__filename, '../public/views/404.html'));
    }
});

app.get('*',function (req, res) {
    res.redirect('/sports');
});



server.listen(httpPort, () => {
    console.log(`App listening at https://cs326-zayin.herokuapp.com:${httpPort}`)
})
