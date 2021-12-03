const CATEGORY_DEFAULT = 'basketball';
const THUMBNAIL_DEFAULT = 'https://www.medaire.com/ResourcePackages/Bootstrap/assets/dist/images/Default_Image_Thumbnail.png';

function defaultStreamTtile(username) {
    return username + '\'s livestream';
}

function newStream(username, title, category=CATEGORY_DEFAULT, live=false, viewers=0, chat=[], thumbnail=THUMBNAIL_DEFAULT) {
    if (title === undefined) {
        title = defaultStreamTtile(username);
    }

    return {
        username: username,
        title: title,
        category: category,
        live: live,
        viewers: viewers,
        chat: chat,
        thumbnail: thumbnail,
    };
}

//username, username + '\'s livestream', 'basketball', false, 0, [], 'https://www.medaire.com/ResourcePackages/Bootstrap/assets/dist/images/Default_Image_Thumbnail.png'
export async function createStreamAndInsert(username, streamCollection) {
    let streamDoc = newStream(username);
    let success = true;
    try {
        await streamCollection.insertOne(streamDoc);
    } catch (e) {
        console.log(e);
        success = false;
    }
    
    return success;
}

export async function getStreams(streamCollection, username={$exists: true}, category={$exists: true}, live={$exists: true}) {
    let query = {
        username: username,
        category: category,
        live: live
    };

    let result = {streams: []};

    try {
        let streamDocs = await streamCollection.find(query).toArray();
        if (streamDocs) {
            result.streams = streamDocs;
        }
    } catch (e) {}

    return result;
}

export async function updateStream(username, title, category, thumbnail, streamCollection) {
    let result = {
        success: false,
        errorMsg: 'THIS IS AN ERROR MESSAGE, SOMETHING WENT WRONG IDIOT'
    }

    let updateRes = await streamCollection.updateOne({
        username: username
    }, {
        $set: {
            title: title,
            category: category,
            thumbnail: thumbnail
        }
    });

    result.success = updateRes.modifiedCount === 1;
    return result;
}