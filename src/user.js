const defaultProfilePic = "FUCK";
import cryptoRandomString from 'crypto-random-string';

const STREAM_KEY_LENGTH = 10;

export function newUser(username, password, streamKey, profilePic) {
    return {
        username: username,
        password: password,
        stream_key: streamKey,
        profilepic: profilePic
    };
}

export function generateStreamKey() {
    return cryptoRandomString({
        length: STREAM_KEY_LENGTH,
        type: 'base64',
    });
}