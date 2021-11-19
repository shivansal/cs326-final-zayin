import pkg from 'mongodb';
const { MongoClient } = pkg;


export async function mongoInit(uri, cb) {
    //set up mongodb connection
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const database = client.db("spazz");

    await client.connect();
    return cb({
        client: client,
        userCollection: database.collection("user"),
        streamCollection: database.collection("stream"),
    });
}

