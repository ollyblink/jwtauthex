# JWT Authentication Example #
<a href="https://www.youtube.com/watch?v=f4F0brwbYKg">Tutorial this is based on</a>

##Required Libraries##
    npm install body-parser jsonwebtoken passport passport-jwt bcrypt-nodejs morgan --save

bcrypt has to be used instead of bcrypt-nodejs if the code is **not** run on a Windows x64 machine. However, some code then needs to be adapted. see the npm pages about the two libraries: <a href="https://www.npmjs.com/package/bcryptjs">bcryptjs</a> and <a href="https://www.npmjs.com/package/bcrypt-nodejs">bcrypt-nodejs</a>

Also install nodemon, which is great to automatically restart the server once something is changed.

    npm install nodemon -g

then call 


    nodemon server.js

Now whenever something is changed, the server is reloaded and it also keeps running and is reloaded in case the server crashed (pretty cool!)

As there is no user interface, requests to test the token need to be sent and received somehow. For that I used chrome's <a href="https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop">Postman</a> extension.

The library used for JWT can be found <a href="https://github.com/auth0/node-jsonwebtoken">HERE</a>
##Summary##
The app only provides login functionality, where a user is created (username is an email address plus a password. The password is hashed using bcrypt-nodejs, see user.js which contains the UserSchema definition for mongoose. UserSchema.pre() generates that hash to not store the password in clear text in the db. An additional comparePassword function below is used to compare the password hash's on authentication). There are 3 links, api/register, api/authenticate, and api/dashboard. The first two are used to register a new user and then to authenticate the user. if the user is found to be in the db and the password matches, a **JWT** is created and returned, see the appRoutes.post('/authenticate') method in server.js. The current implementation does not use RSA public/private keys but symmetric keys to sign the token, thus it needs a secret that is defined in config.js (secret). The token here expires in 120 secs. The dashboard link is only used to demonstrate a page that needs authentication to be accessed. So passport.authenticate needs to be called (with jwt and session:false). 

So to run the app, again nodeman server.js needs to be typed in the terminal. Then in postman, first register a new user by POST http://localhost:3000/api/register and add two fields email and password. click x-www-form-urlencoded. After registring, change the url to http://localhost:3000/api/authenticate, and use the same email and password. Returned will be a JWT on success. Remember the JWT expires in 2mins. Next, change the url to http://localhost:3000/api/dashboard, and in the Headers bar add a field called Authorization and paste the complete JWT you got before ('JWT ...') in the value field. Send. If it is successfuly, it will read "it worked: user id is : ..".
If something is unclear, just watch the <a href="https://www.youtube.com/watch?v=f4F0brwbYKg">tutorial</a>.