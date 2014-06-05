var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var bodyParser = require('body-parser');
var MongoStore = require('connect-mongo')(expressSession);

var routes = require('./routes/index');
var admin = require('./routes/admin');
var selfies = require('./routes/selfies');
var auth = require('./routes/auth');
var users = require('./routes/users');

var app = express();

// forcing SSL
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.locals.pretty = true;

app.use(favicon());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(expressSession({
  secret: "tellmeasecret123",
  store: new MongoStore({ url: process.env.MONGO_DB })
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));

app.use('/auth/:token', auth.authenticate);

//Requires Authentication as a User
app.use(auth.checkAuthentication);

app.use('/', routes);
app.use('/', selfies);
app.use('/', users);
app.use('/users', users);

app.post('/admin/login', auth.adminLogin);

//Requires Authentication as Admin and User
app.use(auth.checkAdmin);
app.use('/admin', admin);

//DEV ROUTES
app.get("/dev/tag", function(req, res) {
  res.render('tag', { imgPath: '/images/galleryIcon.png'});
});
app.get("/dev/sesh", function(req, res) {
  if (typeof req.session.bob == "undefined") {
    req.session.bob = "BOB";
    res.send("Not Defined");
  }
  else {
    res.send(req.session.bob);
  }
});
app.get("/dev/tag", function(req, res) {
  res.render('tag', {imgPath: "/images/galleryIcon.png"});
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') !== 'development') {
  app.use(function(req, res, next) {
    if(!req.secure) {
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    next();
  });
}

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
