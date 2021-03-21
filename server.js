require('dotenv').config()
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
var port = process.env.PORT || '80';
const app = express();
const path = require('path');
const {v4:uuidv4} = require('uuid');
app.use('/css', express.static('css'))
app.use('/images', express.static('images'))
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const redisClient = redis.createClient();
redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
});


var mysession = session({
  secret: 'helloworld',
  genid: (req) => {
    return uuidv4()
  },
  store: new redisStore({ host: 'localhost', port: 6379, client: redisClient }),
  name: '_redisDemoPortal',
  resave: false,
  cookie: { secure: false, maxAge: 2000000 }, // Set to secure:false and expire in 1 minute for demo purposes
  saveUninitialized: true
})
app.use(mysession)

app.use((req, res, next) =>{
  var full_address = req.protocol + "://" + req.headers.host + req.originalUrl;
  console.log(Date.now(),full_address)
  if(req.session.userid){
    res.locals.isuser = true
    res.locals.username = req.session.username;
  }else{
    res.locals.isuser = false
    res.locals.username = ''
  }
  next()
})

var routesPath = path.join(__dirname, "routes");

require("fs").readdirSync(routesPath).forEach(function(file) {
  let r = require("./routes/" + file);
     app.use('/',r)
 }); 

 const livereload =require('livereload')
 const livereloadMiddleware  =require('connect-livereload')
 const hotServer = livereload.createServer({
  // Reload on changes to these file extensions.
  exts: [ 'ejs', 'mustache' ],
  // Print debug info
  debug: true
});

// Specify the folder to watch for file-changes.
hotServer.watch(__dirname);

 app.use(livereloadMiddleware());

app.listen(port, () => {
    console.log(`Server started on Port ${port}`);
});

