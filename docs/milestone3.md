MongoDB collections: user, stream, sport
```
user document
{
	_id: <ObjectId1>,
    username: <String> //user's username,
    hash: <String> //sha512 hashed password,
    salt: <String> //used for hashing passwords,
    stream_key: <String> //secret unique key used for streaming verification,
    profilepic: <String> //url to a profile picture image
}

stream document 
{
        _id: <ObjectId1>,
        username: <String> //stream owner's username,
        title: <String> //title of the stream,
        category: <String> //sports category of the stream,
        live: <Boolean> //true=stream is live, false = not live,
        viewers: <Integer> //number of viewers currently watching,
        chat: <Array<Object>> //array of chat message objects: {username: <String>, msg: <String>}
        thumbnail: <String> //img src to display on /browse
}


sport document
{
    _id: <ObjectId1>,
    name: <String> //used to identify the sports category 'basketball', 'football', etc,
    image: <String> //url for thumbnail images to display on /sports page
}
```

Division of Labor  
Kyle: Chat implementation, Streaming implementation, user CRUD implementation  
Shiv: Sports CRUD implementation, Database setup and configuration, stream CRUD implementation  
Mihir: Navbar implementation

