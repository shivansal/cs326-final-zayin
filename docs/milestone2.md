APIs

Heroku url: https://cs326-zayin.herokuapp.com/sports

```
Schema User {
	username: string,
	password: string,
	stream_key: string,
	profilepic: string
}
```
```
Schema Stream {
	username: string,
	title: string,
	category: string //set by user, category they are streaming in
	live: boolean,
	viewers: number,
	Chat: array of tuples: [{username:string, msg: string}]
}
```

```
Schema Sport {
	name: string,
	Image: string //image src to display on sports.html, maybe we don’t need this?
}
```

*Every ‘User’ has a corresponding ‘Stream’ document in the DB. The username field is the unique identifier that connects these two documents. I.e If you have the ‘User’ document you can perform a lookup in the ‘Streams’ collection to find the corresponding stream by doing DB.Streams.find({username: user.Username}).  	


User API&nbsp;
	
    GET /signup
		1. View endpoint that renders signup.html
	
	POST /signup
		Allows new user to sign up
        1. Adds new User object to DB.users. req.body will contain username, password. 
        2. req.body.username must be unique
        3. Additionally inserts a corresponding ‘Stream’ document with the same username and default properties into DB.Streams
        4. Returns JSON response {success: boolean, error: string, redirecturl: string}, the error field will contain an error message if user creation failed
        5. Tells the client to set a session cookie (will be implemented when authentication is fully implemented)

    GET /login
		1. View endpoint that renders login.html

	POST /login
		Allows user to sign in
        1. req.body contains username, password
        2. Perform authentication
        3. Returns JSON response {success: boolean, error: string, redirecturl: string}, the error field will contain an error message if login failed
        4. Tells client to set session cookie (will be implemented when authentication is fully implemented)

	GET /user/info
		Returns JSON response containing information in ‘User’ document and corresponding ‘Stream’ document
        1. User must be authenticated to use this endpoint, because the ‘streamkey’ field is sensitive information
        2. Database lookup performed using session cookie

    GET /user
		View endpoint that renders ‘user.html’
        1. User must be authenticated to use this endpoint
        2. Use session cookie to lookup ‘User’ document in DB.Users and then get corresponding stream in DB.streams
        3. If not found, then redirect to /user/auth

	GET /user/update
		Endpoint that allows the user.profilepic field to be updated.
        1. req.body.profilepic
	
Stream API&nbsp;

	POST /stream/update?
		Allows user to update their stream title and category
        1. req.body contains title and category to set to
        2. Must be authenticated to use this endpoint
        3. Get the ‘Stream’ document in DB.Streams and update it
        4. Return a JSON response {success: boolean}, success === true if update was successful, false otherwise
		
	GET /stream/get?category=xxx&username=xxx&live=xxx
		Returns JSON response containing matching ‘Stream’ documents in DB.Streams
        1. Response contains Stream documents that have fields live === req.query.live and category === req.query.category and username == req.query.username
        2. If username or category 

    GET /stream/browse?category=xxx
		1. View endpoint that renders ‘category.html’
        2. Uses the /stream/get endpoint to display streams with category === req.query.category


Sports API&nbsp;

    GET /sports/get
	    Returns JSON response containing all ‘Sport’ documents in DB.Sports

	GET /sports
		View endpoint that renders sports.html’.
        1. Will use /sports/get endpoint to render all sports on page

Live API&nbsp;

	GET /live/{username}
		View endpoint that renders ‘stream.html’
        1. The stream itself is retrieved from ‘http://localhost:8000/live/{username}.flv’, this is what node-media-server forces us to use.


Websockets (node-media-server forces us to use these also)&nbsp;

	/prePublish id, StreamPath, args
		Fired when user attempts to start streaming from an rtmp client
        1. Get the username from the stream path
        2. Verify that a `User` document exists in DB.Users exists with this username
        3. If so, Get streamkey from args.key and verify it with the one stored in the `User` document
        4. If both of these checks succeed allow the stream to go live, otherwise reject it

Websockets (for stream chat)&nbsp;

	Server side
	/chat/connection?streamer_name=xxx
			Fires when user joins a stream chat
            1. The streamer_name argument is used to perform a lookup in DB.Streams to determine if this stream exists
            2. If the stream exists then the socket is added to the corresponding socket.io room, and stream.viewers is incremented
			
		/chat/{room_name}/chatMessage, arguments: {msg: Message}
			Fires when a user sends a chat message in `{room_name}` chat room. Will emit an event to all sockets in that room with the username of sender and msg

    /chat/disconnect
            Fires when a socket disconnects
	        1. Get the ‘Stream’ document from DB.streams corresponding to the chat that the user was in.
            2. Decrement the viewers field

	Client side
		/chat/chatMessage, arguments {username: string, msg: string}
			Fires when the server emits a chatMessage event
			1. Will update the chat by adding a new message with username = username, message = msg

Screenshots: All screenshots are in screenshot folder

/live.png: Renders the stream and chat

/sports.png: Renders all sports categories 

/stream/browse.png: Renders all live streams in a specific category

/user.png: Display user info and allow for updating

How to build:

	1. npm install
	2. node app.js

Division of labor
Kyle: Backend skeleton, API documentation, chat page, user page, login page&nbsp;
Shiv: Backend skeleton, signup page, categories/browse page&nbsp;
Mirhir: Backend skeleton, sports page, navbar work&nbsp;
