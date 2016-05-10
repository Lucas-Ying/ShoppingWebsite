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
//var parseForm = bodyParser.urlencoded({extended: false});
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

//========================RESTful API for Product ====================//
//get products
app.get('/get_product', csrfProtection, function (req,res){
  var productName = req.body.name;

  var query = client.query("select * from products");
  var results =[];

  //error handler for /get_product
  query.on('error',function(){
    res.status(500).send('Error, fail to get product: '+productName);
  });

  //stream results back one row at a time
  query.on('row',function(row){
    results.push(row);
  });

  //After all data is returned, close connection and return results
  query.on('end',function(){
    res.json(results);
    console.log("result: "+result);
  });
});

//adding product
app.put('/add_product', csrfProtection, function(req, res){
  var productId = req.body.id;
  var productName = req.body.name;
  var productCost = req.body.cost;
  var productDes = req.body.description;
  
  var q = "insert into products (name,cost,description) values ($1,$2,$3) RETURNING id,name,cost,description";
  var query = client.query(q, [productName,productCost,productDes]);
  var results =[];

  //error handler for /add_product
  query.on('error',function(){
    res.status(500).send('Error, fail to add product id:'+productId +' product: '+productName);
  });

  //stream results back one row at a time
  query.on('row',function(row){
    results.push(row); 
  });

  //after all the data is returned close connection and return result
  query.on('end',function(){
    res.json(results);
    console.log("result: "+result);
  });
});


//update product 
app.post('/update_product', csrfProtection, function(req, res){
  var productId = req.body.id;
  var productName = req.body.name;
  var productCost = req.body.cost;
  var productDes = req.body.description;

  var q = "update products set name = $1, cost = $2, description = $3 where id = $4 RETURNING id,name,cost,description";
  var query = client.query(q, [productName,productCost,productDes,productId]);
  var results =[];

  //error handler for /update_product
  query.on('error',function(){
    res.status(500).send('Error, fail to update product id:'+productId +' product: '+productName);
  });

  //stream results back one row at a time
  query.on('row',function(row){
    results.push(row);
  });

  //after all the data is returned close connection and return result
  query.on('end',function(){
    res.json(results);
    console.log("result: "+result);
  });
});


//delete product
app.delete('/delete_product', csrfProtection, function(req, res){
  var productId = req.body.id;
  var productName = req.body.name;
  var productCost = req.body.cost;
  var productDes = req.body.description;

  var q = "delete from products where id = $1 RETURNING id,name,cost,description";
  var query = client.query(q, [productId]);
  var results =[];

  //error handler for /delete_product
  query.on('error',function(){
    res.status(500).send('Error, fail to delete product id:'+productId +' product: '+productName);
  });

  //stream results back one row at a time
  query.on('row',function(row){
    results.push(row);
  });

  //after all the data is returned close connection and return result
  query.on('end',function(){
    res.json(results);
    console.log("result: "+result);
  });
});

//===================================================================//

//========================RESTful API for users =====================//
//get users
app.get('/get_users', csrfProtection, function (req,res){
  var userName = req.body.name;

  var query = client.query("select * from users");
  var results =[];

  //error handler for /get_users
  query.on('error',function(){
    res.status(500).send('Error, fail to get users: '+userName);
  });

  //stream results back one row at a time
  query.on('row',function(row){
    results.push(row);
  });

  //After all data is returned, close connection and return results
  query.on('end',function(){
    res.json(results);
    console.log("result: "+result);
  });
});

//adding users
app.put('/add_user', csrfProtection, function(req, res){
  var userId = req.body.id;
  var userEmail = req.body.email;
  var userPass = req.body.pass;
  var userName = req.body.name;
  var userCart = req.body.cart;

  var q = "insert into users (email,pass,name,cart) values ($1,$2,$3,$4) RETURNING id,email,pass,name,cart";
  var query = client.query(q, [userEmail,userPass,userName,userCart]);
  var results =[];
  
  //error handler for /add_user
  query.on('error',function(){
    res.status(500).send('Error, fail to add user Id:'+userId +' Name: '+userName);
  });

  //stream results back one row at a time
  query.on('row',function(row){
    results.push(row); 
  });

  //after all the data is returned close connection and return result
  query.on('end',function(){
    res.json(results);
    console.log("result: "+result);
  });
});

//update users 
app.post('/update_user', csrfProtection, function(req, res){
  var userId = req.body.id;
  var userEmail = req.body.email;
  var userPass = req.body.pass;
  var userName = req.body.name;
  var userCart = req.body.cart;

  var q = "update users set email = $1, pass = $2, name = $3 cart = $4 where id = $5 RETURNING id,email,pass,name,cart";
  var query = client.query(q, [userEmail,userPass,userName,userCart,userId]);
  var results =[];

  //error handler for /update_user
  query.on('error',function(){
    res.status(500).send('Error, fail to update user Id:'+userId +' Name: '+userName);
  });

  //stream results back one row at a time
  query.on('row',function(row){
    results.push(row);
  });

  //after all the data is returned close connection and return result
  query.on('end',function(){
    res.json(results);
    console.log("result: "+result);
  });
});


//delete users
app.delete('/delete_user', csrfProtection, function(req, res){
  var userId = req.body.id;
  var userEmail = req.body.email;
  var userPass = req.body.pass;
  var userName = req.body.name;
  var userCart = req.body.cart;

  var q = "delete from users where id = $1 RETURNING id,email,pass,name,cart";
  var query = client.query(q, [userId]);
  var results =[];

  //error handler for /delete_user
  query.on('error',function(){
    res.status(500).send('Error, fail to delete user Id:'+userId +' Name: '+userName);
  });

  //stream results back one row at a time
  query.on('row',function(row){
    results.push(row);
  });

  //after all the data is returned close connection and return result
  query.on('end',function(){
    res.json(results);
    console.log("result: "+result);
  });
});

//===================================================================//


//========================RESTful API for cart =====================//
//get cart
app.get('/get_cart', csrfProtection, function (req,res){
  var cartUserId = req.body.userID;

  var query = client.query("select * from cart");
  var results =[];

  //error handler for /get_cart
  query.on('error',function(){
    res.status(500).send('Error, fail to get cart from user userID: '+cartUserId);
  });

  //stream results back one row at a time
  query.on('row',function(row){
    results.push(row);
  });

  //After all data is returned, close connection and return results
  query.on('end',function(){
    res.json(results);
    console.log("result: "+result);
  });
});

//adding items to cart
app.put('/addTocart', csrfProtection, function(req, res){
  var cartId = req.body.id;
  var cartUserId = req.body.userID;
  var cartBalance = req.body.balance;
  var cartItem = req.body.items;

  var q = "insert into cart (userID,balance,items) values ($1,$2,$3) RETURNING id,userID,balance,items";
  var query = client.query(q, [cartUserId,cartBalance,cartItem]);
  var results =[];
  
  //error handler for /addTocart
  query.on('error',function(){
    res.status(500).send('Error, fail to add to cart Id:'+cartId +' items: '+cartItem);
  });

  //stream results back one row at a time
  query.on('row',function(row){
    results.push(row); 
  });

  //after all the data is returned close connection and return result
  query.on('end',function(){
    res.json(results);
    console.log("result: "+result);
  });
});

//update cart items 
app.post('/update_cart', csrfProtection, function(req, res){
  var cartId = req.body.id;
  var cartUserId = req.body.userID;
  var cartBalance = req.body.balance;
  var cartItem = req.body.items;

  var q = "update cart set balance = $1, items = $2 where id = $3 and userID = $4 RETURNING id,userID,balance,items";
  var query = client.query(q, [cartBalance,cartItem,cartId,cartUserId]);
  var results =[];

  //error handler for /update_cart
  query.on('error',function(){
    res.status(500).send('Error, fail to update cart Id:'+cartId +' cartUserID: '+cartUserID+' items: '+cartItem);
  });

  //stream results back one row at a time
  query.on('row',function(row){
    results.push(row);
  });

  //after all the data is returned close connection and return result
  query.on('end',function(){
    res.json(results);
    console.log("result: "+result);
  });
});


//delete cart from user
app.delete('/delete_cart', csrfProtection, function(req, res){
  var cartId = req.body.id;
  var cartUserId = req.body.userID;
  var cartBalance = req.body.balance;
  var cartItem = req.body.items;

  var q = "delete from cart where id = $1 RETURNING id,userID,balance,items";
  var query = client.query(q, [cartId]);
  var results =[];

  //error handler for /delete_cart
  query.on('error',function(){
    res.status(500).send('Error, fail to delete cart Id:'+cartId +' items: '+cartItem);
  });

  //stream results back one row at a time
  query.on('row',function(row){
    results.push(row);
  });

  //after all the data is returned close connection and return result
  query.on('end',function(){
    res.json(results);
    console.log("result: "+result);
  });
});

//===================================================================//

// error handler for CSRF
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN'){
    return next(err);
  }
  // handle CSRF token errors here 
  res.status(403);
  res.render('error', {
      message: err.message,
      error: err
  });
  //res.send('form tampered with');
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
