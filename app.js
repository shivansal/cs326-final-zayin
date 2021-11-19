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
import crypto from 'crypto';

import { generateStreamKey, newUser } from './src/user.js';
import {newStream} from './src/stream.js';
import { mongoInit } from './src/mongo.js';

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

    let mongoRes = await userCollection.findOne({'username': username})
    if(mongoRes != null){
        res.json({
            success: false,
            errorMsg: "Username taken",
        });
    }
    else{
        let salt = crypto.randomBytes(16).toString('hex')
        let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
        const newUserDoc = newUser(username, hash, salt, generateStreamKey(), profilePic)
        let success = true;
        let errorMsg = '';
        let redirectUrl = 'https://cs326-zayin.herokuapp.com/login';

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
    }

    
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
        redirectUrl: 'https://cs326-zayin.herokuapp.com/sports'
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

app.get('/user/info', async (req, res) => {
    if (req.isAuthenticated()) {
        let mongoRes = await streamCollection.findOne({'username': req.user.username});
        let fakeRes = {
            success: true,
            username: req.user.username,
            salt: req.user.salt,
            hash: req.user.hash,
            stream_key: req.user.stream_key,
            stream_title: mongoRes.title,
            stream_category: mongoRes.category,
            profilepic: req.user.profilepic,
            stream_thumbnail: mongoRes.thumbnail,
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

app.get('/user', checkLoggedIn, (req, res) => {
    /* Confirm the user is authorized here
        If not we would normally redirect
        Otherwise render user.html
    */

    res.sendFile(Path.join(__filename, '../public/views/user.html'));
});

//stream api
app.post('/stream/update', async (req, res) => {
    // console.log(req.body)
    let category = (req.body.category).trim().toLowerCase();
    let mongoRes = await sportCollection.findOne({'name': category})
  
    // console.log(req.user)
    if(mongoRes == null){
        res.json({
            success: false,//or false if failed
            error: "Not a valid category"
        });
    }
    else{
        let newObj = {}
    
        if(req.body.title.length != 0){
            newObj["title"] = req.body.title
        }
        if(req.body.category.length != 0){
            newObj["category"] = req.body.category
        }
        if(req.body.thumbnail.length != 0){
            newObj["thumbnail"] = req.body.thumbnail
        }
        let updateRes = await streamCollection.updateOne({"username": req.user.username}, {$set: newObj});
        res.json({
            success: true //or false if failed
        });
    }
});

app.post('/stream/get', async (req, res) => {
    let query = {}

    if (req.body.username) {
        query.username = req.body.username;
    }

    if (req.body.category) {
        query.category = req.body.category;
    }

    if (req.body.live) {
        query.live = req.body.live;
    }

    let streamDocs = await streamCollection.find(query).toArray();
    if (streamDocs) {
        res.json({'streams': streamDocs});
    } else {
        res.json({'streams': []});
    }
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
