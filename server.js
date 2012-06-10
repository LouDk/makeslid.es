var app      = require('express').createServer()
  , io       = require('socket.io').listen(app)
  , whiskers = require('whiskers');
  
app.register('.html', whiskers)
   .set('views', __dirname+'/templates')
   .listen(3000);

app.get('/', function(req, res) {
  res.render('index.html', {title: 'makeslid.es - Slide'});
});

app.get('/control', function (req, res) {
  res.render('control.html', {title: 'makeslid.es - Control'});
})

io.sockets.on('connection', function (socket) {
  socket.on('control', function (data) {
    io.sockets.emit('control', data);
    console.log(data);
  });
});