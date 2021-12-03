import crypto from 'crypto';
import { createUserAndInsert} from './user.js';
import {createStreamAndInsert} from './stream.js';

export function checkLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
	// If we are authenticated, run the next route.
	next();
    } else {
	// Otherwise, redirect to the login page.
	res.redirect('/login');
    }
}

export async function signUp(username, password, userCollection, streamCollection) {
    let success = false;
    let errorMsg = 'Signup Failed';
    const redirectUrl = 'https://cs326-zayin.herokuapp.com/login';

    //check for already existing users with username
    let dbResponse = await userCollection.findOne({ 'username': username })
    if (dbResponse === null) {
        let salt = crypto.randomBytes(16).toString('hex')
        let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);

        //create and insert user
        success = createUserAndInsert(username, hash, salt, userCollection);
        if (success) {
            //create stream, insert it
            success = await createStreamAndInsert(username, streamCollection);
        }
    } else {
       errorMsg = 'Username taken';
    }

    return {
        success: success,
        errorMsg: errorMsg,
        redirectUrl: redirectUrl,
    }
}