import cryptoRandomString from 'crypto-random-string';

const STREAM_KEY_LENGTH = 20;
const DEFAULT_PROFILEPIC = "https://moonvillageassociation.org/wp-content/uploads/2018/06/default-profile-picture1.jpg";

export function newUser(username, hash, salt, streamKey, profilePic=DEFAULT_PROFILEPIC) {
    if (streamKey === undefined) {
        streamKey = generateStreamKey();
    }

    return {
        username: username,
        hash: hash,
        salt: salt,
        stream_key: streamKey,
        profilepic: profilePic
    };
}

export function generateStreamKey() {
    return cryptoRandomString({
        length: STREAM_KEY_LENGTH,
        type: 'alphanumeric',
    });
}

export async function createUserAndInsert(username, hash, salt, userCollection) {
    let success = true;
    const userDoc = newUser(username, hash, salt);
    
    try {
        await userCollection.insertOne(userDoc);
    } catch (e) {
        console.log(e);
        success = false;
    }
    
    return success;
}

//gets nonsensitive user info for 'username'
export async function getSafeUserInfo(username, userCollection) {
    let result = {success:false, username:'', profilePic:''};
    try {
        let userRes = await userCollection.findOne({'username': username});
        if (userRes) {
            result.success = true;
            result.username = userRes.username;
            result.profilepic = userRes.profilepic;   
        }
    } catch (e) { console.log(e); }

    return result;
}

export async function getAllUserInfo(username, userCollection) {
    let userRes = await userCollection.findOne({'username': username});

    let result = {
        success: false, username: '', salt: '',
        hash: '', stream_key: '', profilepic: '',
        stream_title: '',
        stream_category: '',
        stream_thumbnail: '',
    };

    if (userRes) {
        result.success = true
        result.username = username
        result.salt = userRes.salt
        result.hash = userRes.hash
        result.stream_key = userRes.stream_key
        result.profilepic = userRes.profilepic
        result.stream_title = userRes.title
        result.stream_category =  userRes.category
        result.stream_thumbnail = userRes.thumbnail
    }
    
    return result;
}

export async function updateUser(username, newProfilePic, userCollection) {
    let result = {
        success: false,
        error: 'Something went horribly wrong, my pain is immeasurable.',
    };
    try {
        let user = await userCollection.findOne({username: username});
        if (user) {
            let updateResult = await userCollection.updateOne({username: username}, {$set: {profilepic: newProfilePic}});
            result.success = updateResult.modifiedCount === 1;
        }
    } catch (e) {}

    return result;
}