# Final

# Team
Team Zayin

# Application Name
SPAZZ

# Semester
Fall 2021

# Overview
Spazz is a web application that enables users to stream and view live ameatur sports. Spazz brings the game to your laptop allowing our users to never have to leave their comfort zone. With low latency streaming and interactive chat, we provide a collaborative space for sport fans to get together. Currently, there is no way for sport fans to tune into amateur sporting events and Spazz hopes to fix this problem.

# Team Member
Kyle Bouvier, Shiv Ansal, Mihir Thakur

# User Interface

## Sign-In Page
Sign-In Page includes text input bars for username and password, and a login button that uses the information of the text input bars to attempt to login. In addition, it includes a "Sign Up" button that redirects to the sign up button.
## Sign-Up Page
Sign-Up Page includes text input bars for username, password and confirm password, and a sign-up button that uses the information of the text input bars to register a new user.
## Sports Page
The Sports Page includes a grid menu of all the sports that are hosted on SPAZZ. Clicking on any of the grid menu option reroutes the user to the category page of the chosen option.
## Category Page
The Category Page includes a grid menu of all the streams available for the sport specified.
## Stream Page
The Stream Page includes a live video stream of the game being streamed. The page also specifies the user hosting the stream and current number of viewers watching the stream. In addition, the stream page includes a chat box that could be used to communicate between viewers of a specific stream
## User Page
The User page includes the users's username, profile picture URL, stream link, stream category and stream key.
In addition, the user page also includes two buttons "Configure Your Profile" and "Configure Your Stream"."Configure Your Profile" opens a pop up menu to edit user's profile picture URL.
"Configure Your Stream" opens a pop up menu to edit user's Stream Title, Stream Thumbnail URL and Stream Category.
## Navigation Bar
The navigation bar includes several buttons:
1. "SPAZZ": It is the title of the website and redirects to the sports page
2. "Sports": redirects to the sports page
3. "Browse": Opens a drop-down menu including all available categories. Clicking each category redirects to the category page of the category selected
4. "Login"/"{username}": The last button is titles loggin, which redirects to the login page. If the user is already logged in, the title of the button is the user's username. Chicking the "{username}" button opens a drop down menu, which includes an option to sign out and an option that redirects to the user page.
## 404 Page
404 Page appears when a 404 error happens. Tt includes a description of the 404 error.

# APIs
1. get('/signup'): get request for the signup page
2. post('/signup'): post request to post and register new users
3. get('/404'): get request for the 404 page
4. get('/login'): get request for the login page
5. post('/login'): post request with the login information of the user. Returns authentication success or faliure. if successful, it redirects the logged in user to sports page. If unsuccessful, it keeps the user at login page.
6. get('/logout'): logs out the user and redirects to login page.
7. get('/user/info'): get request to retrieve username, stream_key, profilepic, stream_title, stream_category,stream_thumbnail: streamRes.thumbnail
8. get('/user/update'): post request to update the user's profile picture link
9. get('/user'): Confirms the user is authorized. If not we would normally redirect Otherwise renders user page.
10. post('/stream/update'): post request to update the user's stream title, stream category, stream thumbnail.
11. get('/stream/browse'): gets the category page for a specific sports category
12. get('/sports/get'): get request to get the list of available sports
13. get('/sports'): get request to redirect to the sports page
14. get('/live/:username'): get request to redirect to the stream page of the specific user
15. get('*'): get request to redirect to sports page for an invalid link