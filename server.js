var express   = require('express')
  , app       = express.createServer()
  , io        = require('socket.io').listen(app)
  , whiskers  = require('whiskers')
  , everyauth = require('everyauth')
  , util      = require('util')
  , user      = require('./lib/user');

// for now just emit whatever we get from one browser to all the others
io.sockets.on('connection', function (socket) {
  socket.on('control', function (data) {
    io.sockets.emit('control', data);
    console.log(data); // and log
  });
});

// use everyauth for authentication
everyauth.twitter
  .consumerKey('FZkv2kYOsJS2lnhF3eZyA')
  .consumerSecret('koLmXkW7CPu0LdbF4vNujuZ5Y9KQEviUjT7rX5iGrp4')
  .findOrCreateUser(function(session, accessToken, accessTokenSecret, twitterUser) {
    console.log(util.inspect(twitterUser));
    session.user = twitterUser.screen_name;
    return {id: 1, source: 'twitter', name: twitterUser.screen_name};
  })
  .redirectPath('/');

// everyauth helpers in views {everyauth.user}
everyauth.helpExpress(app);
everyauth.everymodule.logoutPath('/bye');

// configuration for all enviroments
app.configure(function() {
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.favicon());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'f68c050369b2482e15c3e0868c2efe8b'}));
  app.use(everyauth.middleware());
  app.register('.html', whiskers);
  app.set('views', __dirname+'/templates');
  app.use(app.router);
});

// development env settings
app.configure('development', function() {
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// production env settings
app.configure('production', function() {
  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

// home page
app.get('/', function(req, res) {
  console.log(req.session.user);
  res.render('index.html');
})


// user profile
app.get('/:name', function(req, res) {
  res.render('profile.html', {name: req.route.params.name});
});

// user presentation
app.get('/:name/:presentation', function(req, res) {
  res.render('presentation.html', {
    name: req.route.params.name, 
    presentation: req.route.params.presentation
  });
});

// user control for presentation
app.get('/:name/:presentation/control', function(req, res) {
  res.render('control.html', {
    name: req.route.params.name, 
    presentation: req.route.params.presentation
  });
});

app.listen(3000);