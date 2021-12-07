import cryptoRandomString from 'crypto-random-string';

const STREAM_KEY_LENGTH = 10;
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
        type: 'base64',
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
        let mongoRes = await userCollection.findOne({'username': username});
        result.success = true;
        result.username = mongoRes.username;
        result.profilepic = mongoRes.profilepic;   
        result.exists = mongoRes.username !== undefined;
    } catch (e) {}

    return result;
}

export async function getAllUserInfo(username, userCollection) {
    let mongoRes = await userCollection.findOne({'username': username});

    let result = {
        success: false, username: '', salt: '',
        hash: '', stream_key: '', profilepic: '',
        stream_title: '',
        stream_category: '',
        stream_thumbnail: '',
    };

    if (mongoRes) {
        result.success = true
        result.username = username
        result.salt = mongoRes.salt
        result.hash = mongoRes.hash
        result.stream_key = mongoRes.stream_key
        result.profilepic = mongoRes.profilepic
        result.stream_title = mongoRes.title
        result.stream_category =  mongoRes.category
        result.stream_thumbnail = mongoRes.thumbnail
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
            console.log("HIT")
            let updateResult = await userCollection.updateOne({username: username}, {$set: {profilepic: newProfilePic}});
            result.success = updateResult.modifiedCount === 1;
        }
    } catch (e) {}

    return result;
}