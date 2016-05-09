var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//use to prevent csrf attack
var csrf = require('csurf'); 
//set up route middlewares
var csrfProtection = csrf({cookie:true});
var parseForm = bodyParser.urlencoded({extended: false});
//use to set http headers
var helmet = require('helmet');

/*
var routes = require('./routes/index');
var users = require('./routes/users');*/

var app = express();
var port = process.env.PORT ||8080;
var eng = require('consolidate');


var pg = require('pg').native;
var connectionString = "postgres://mppnikubyzarbu:Pn4vmfbqSSS22ZFW3N-35Xflf1@ec2-50-17-249-147.compute-1.amazonaws.com:5432/dbgkce5fglr4rs";
var client = new pg.Client(connectionString);
client.connect();

pg.connect(connectionString, function(err, client, done)
{
  if(err){
    console.error('Could not connect to the database');
    console.error(err);
    return;
  }
  console.log('Connected to database');
  client.query("SELECT * FROM users;", function(error, result){
    done();
    if(error){
    }
    //console.log(result);
  });
});
//--------------------------------------------TESTS----------------------------------------------------
app.get('/test_database_get', function(request, response) {

  var query = client.query("SELECT * FROM users");
  var results = []
  // Stream results back one row at a time
  query.on('row', function(row) {
    results.push(row);
  });

  // After all data is returned, close connection and return results
  query.on('end', function() {
    response.json(results);
    console.log('Result: ' + results);
  });
});

app.get('/test_database_put', function(request, response) {
  //
  var query = client.query("INSERT into users (email, pass, name) values($1, $2, $3)", ["test@email.com", "RandomPassword", "John Doe"]);

  query = client.query("SELECT * FROM users");
  var results = []
  // Stream results back one row at a time
  query.on('row', function(row) {
    results.push(row);
  });

  // After all data is returned, close connection and return results
  query.on('end', function() {
    response.json(results);
    console.log('Result: ' + results);
  });
});

app.get('/test_database_post', function(request, response) {
  //
  var query = client.query("UPDATE users SET pass=($1) where email=($2)", ["changedPassword", "test@email.com"]);

  query = client.query("SELECT * FROM users");
  var results = []
  // Stream results back one row at a time
  query.on('row', function(row) {
    results.push(row);
  });

  // After all data is returned, close connection and return results
  query.on('end', function() {
    response.json(results);
    console.log('Result: ' + results);
  });
});

app.get('/test_database_delete', function(request, response) {
  //
  var query = client.query("DELETE from users where email =($1)", ["test@email.com"]);

  query = client.query("SELECT * FROM users");
  var results = []
  // Stream results back one row at a time
  query.on('row', function(row) {
    results.push(row);
  });

  // After all data is returned, close connection and return results
  query.on('end', function() {
    response.json(results);
    console.log('Result: ' + results);
  });
});

//--------------------End Tests------------------------------------------------


// view engine setup
app.set('views', path.join(__dirname, '/public'));
app.engine('html', eng.swig);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use(helmet());//use to set http headers

/*app.use('/', routes);
app.use('/users', users);*/

//render main page
app.get('/',csrfProtection,function(err,res,req,next){
  //pass the csrftoken to the view
  //when using this can see example at https://www.npmjs.com/package/csurf
  res.render('index.html',{csrftoken: req.csrftoken()});
});


// error handler for CSRF
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN'){
    return next(err);
  }
  // handle CSRF token errors here 
  res.status(403);
  res.send('form tampered with');
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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

app.listen(port, function () {
  console.log("ShoppingWebsite app listening on port: "+port+"!");
});