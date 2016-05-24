var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var config            =     require('./configuration/config');
var FacebookStrategy  =     require('passport-facebook').Strategy;
var session = require('express-session');
var Grant = require('grant-express');
var passport = require('passport');
var grant = new Grant(require('./config.json'));
//use to prevent csrf attack
var csrf = require('csurf');
//set up route middlewares
//var csrfProtection = csrf({cookie:true});
//var parseForm = bodyParser.urlencoded({extended: false});
//use to set http headers
var helmet = require('helmet');

var routes = require('./routes/index');
var users = require('./routes/users');

var Purest = require('purest')
, facebook = new Purest({provider: 'facebook'})
, twitter = new Purest({provider: 'twitter',
	key: 'VDu9V8pV9ukxUs89JiWxoSwoH', secret: 'AR5aS5c2vZr9sVDkROnLg4ZylJTAPRy2NeHAP7QUEcyNr5v8j1'})

var app = express();

var port = process.env.PORT ||8080;
// var eng = require('consolidate');

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

// Passport session setup.
passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(obj, done) {
	done(null, obj);
});
// Use the FacebookStrategy within Passport.
passport.use(new FacebookStrategy({
	clientID: config.facebook_api_key,
	clientSecret:config.facebook_api_secret ,
	callbackURL: config.callback_url,
	profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified'],

},
function(accessToken, refreshToken, profile, done) {
	process.nextTick(function () {
		console.log("ID: " +  profile.id + " name: " +  profile.name.givenName + ' ' + profile.name.familyName + " email: " + profile.emails[0].value);
		addUserIfNeeded(profile);
		return done(null, profile);
	});
}
));

app.use(session({ secret: 'a secret shopping cart', key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());

//====================OAUTH===================================
app.use(logger('dev'))
// mount grant
app.use(grant)

//Passport Router
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
	passport.authenticate('facebook', {

		successRedirect : '/kart', 
		failureRedirect: '/login',
    //   scope['email'] 
}),
	function(req, res) {
		res.redirect('/');
	});
app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next(); }
		res.redirect('/login')
	}

//app.get('/facebook_callback', function (req, res) {
function addUserIfNeeded (profile) {
		var profileID = profile.id;
		var usersName =  profile.name.givenName + ' ' + profile.name.familyName;
		var usersEmail =  profile.emails[0].value;

// //check if they exist in the db
	if(usersEmail != null || usersEmail != 'undefined')
	{
	var q = "SELECT * FROM users where email = $1";
  var query = client.query(q, [usersEmail]);
  var results =[];

  // Stream results back one row at a time
  query.on('row', function(row) {
  	results.push(row);
  });

  // After all data is returned, close connection and return results
  query.on('end', function() {
  	console.log("results length " + results.length);
  	if(results.length == 0)
  	{
  		addUser(usersName, usersEmail);
  	}
  	console.log('Result: ' + results);
  });
}
}

function addUser(name, email){
  console.log("in add user");

  sessionStorage.setItem('username', name);
  sessionStorage.setItem('useremail', email);
  console.log("name: "+sessionStorage.getItem('userName')+" email: " +sessionStorage.getItem('useremail'));
  //user isnt in the db so we want to add them
  var q = "insert into users (name, email) values ($1, $2)";
  var query = client.query(q, [name, email]);
  var results =[];

  //error handler 
  query.on('error',function(){
   //res.status(500).send('Error, failed to add new user');
  });

  //stream results back one row at a time
  query.on('row',function(row){
    results.push(row);
    console.log("Results of add user: " + row)

  });

  //after all the data is returned close connection and return result
  query.on('end',function(){
    console.log(results);
    console.log("logged in successfully!");
    //res.json(results);
  });
}

/*app.get('/twitter_callback', function (req, res) {
  var accessToken = req.query.access_tokens
  console.log(req.query)
  res.end(JSON.stringify(req.query, null, 2))
})*/


var OAuth = require('oauth').OAuth
, oauth = new OAuth(
	"https://api.twitter.com/oauth/request_token",
	"https://api.twitter.com/oauth/access_token",
	"NFE9tO39ZJHqy0TcRJ8zT3JKp",
	"Xd4kzzp7rpxkmPzUPFHLyIwRrnbEvaNjlbpdMqCvB0Jt6NrcaQ",
	"1.0",
	"https://tranquil-journey-51576.herokuapp.com/index",
	"HMAC-SHA1"
	);


  app.get('/auth/twitter', function(req, res) {

  	oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
  		if (error) {
  			console.log(error);
  			res.send("Authentication Failed!");
  		}
  		else {
  			req.session.oauth = {
  				token: oauth_token,
  				token_secret: oauth_token_secret
  			};
  			console.log(req.session.oauth);
  			res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
  		}
  	});

  });

  app.get('/auth/twitter/callback', function(req, res, next) {

  	if (req.session.oauth) {
  		req.session.oauth.verifier = req.query.oauth_verifier;
  		var oauth_data = req.session.oauth;

  		oauth.getOAuthAccessToken(
  			oauth_data.token,
  			oauth_data.token_secret,
  			oauth_data.verifier,
  			function(error, oauth_access_token, oauth_access_token_secret, results) {
  				if (error) {
  					console.log(error);
  					res.send("Authentication Failure!");
  					res.redirect('https://tranquil-journey-51576.herokuapp.com/register.html');
  				}
  				else {
  					req.session.oauth.access_token = oauth_access_token;
  					req.session.oauth.access_token_secret = oauth_access_token_secret;
  					console.log(results, req.session.oauth);
  					res.send("Authentication Successful");
  					res.redirect('https://tranquil-journey-51576.herokuapp.com/index.html'); 
  				}
  			}
  			);
  	}
  	else {
    res.redirect('https://tranquil-journey-51576.herokuapp.com/login.html'); // Redirect to login page
}
});

//=============================END OAUTH===========================

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
app.set('views', path.join(__dirname, 'views'));
// app.engine('html', eng.swig);
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());//use to set http headers

app.use('/', routes);
app.use('/users', users);

//render main page
app.get('/',function(err,res,req,next){
  //pass the csrftoken to the view
  //when using this can see example at https://www.npmjs.com/package/csurf
  res.render('index',{csrftoken: req.csrftoken()});
});

app.get('/userPresent', function (req, res) {
	var html = "<ul>\
	<li><a href='/auth/github'>GitHub</a></li>\
	<li><a href='/logout'>logout</a></li>\
	</ul>";

  // dump the user for debugging
  if (req.isAuthenticated()) {
  	html += "<p>authenticated as user:</p>"
  	html += "<pre>" + JSON.stringify(req.user, null, 4) + "</pre>";
  	console.log("User email: " + req.user.email + "User email2: " + req.user.value + " users name: " + req.user+ " " + res.query)
  }

  res.send(html);
});

//========================RESTful API for Product ====================//
//get products
app.get('/get_product', function (req,res){
//  var productName = req.body.name;

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
  	console.log("result: "+results);
  });
});

//adding product
app.put('/add_product', function(req, res){
	var productName = req.body.name;
	var productCost = req.body.cost;
	var productDes = req.body.description;
  // console.log("add product request");
  console.log("name: " + productName + " cost: " + productCost + " Description: " + productDes);
  var q = "insert into products (name,cost,description) values ($1,$2,$3) RETURNING id,name,cost,description";
  var query = client.query(q, [productName,productCost,productDes]);
  var results =[];

  //error handler for /add_product
  query.on('error',function(){
  	res.status(500).send('Error, fail to add product product: '+productName);
  });

  //stream results back one row at a time
  query.on('row',function(row){
  	results.push(row);
  });

  //after all the data is returned close connection and return result
  query.on('end',function(){
  	res.json(results);
  	console.log("result: "+results);
  });
});


//update product
app.post('/update_product', function(req, res){
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
  	console.log("result: "+results);
  });
});


//delete product
app.delete('/delete_product', function(req, res){
	var productId = req.body.id;

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
  	console.log("result: "+results);
  });
});

//===================================================================//

//========================RESTful API for users =====================//
//get users
app.get('/get_users', function (req,res){
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
  	console.log("result: "+results);
  });
});

app.get('/get_user', function (req,res){
	var userEmail = req.body.email;
	var userPass = req.body.pass;
  //console.log(userEmail);
  var q = "SELECT * FROM users WHERE email=$1 RETURNING id,email,pass,name";
  var query = client.query(q, [userEmail]);

  var results =[];

  //error handler for /get_users
  query.on('error',function(){
  	res.status(500).send('Error, fail to get users: '+userEmail);
  });

  //console.log(results);

  //stream results back one row at a time
  query.on('row',function(row){
  	results.push(row);
  });

  //After all data is returned, close connection and return results
  query.on('end',function(){
  	res.json(results);
  	console.log("result: "+results);
  });
});

//adding users
app.put('/add_user', function(req, res){
	var userEmail = req.body.email;
	var userPass = req.body.pass;
	var userName = req.body.name;
	var userCart = req.body.cart;

	var q = "insert into users (email,pass,name) values ($1,$2,$3) RETURNING id,email,pass,name";
	var query = client.query(q, [userEmail,userPass,userName]);
	var results =[];

  //error handler for /add_user
  query.on('error',function(){
  	res.status(500).send('Error, fail to add user Name: '+userName);
  });

  //stream results back one row at a time
  query.on('row',function(row){
  	results.push(row);
  });

  //after all the data is returned close connection and return result
  query.on('end',function(){
  	res.json(results);
  	console.log("result: "+results);
  });
});

//update users
app.post('/update_user', function(req, res){
	var userId = req.body.id;
	var userEmail = req.body.email;
	var userPass = req.body.pass;
	var userName = req.body.name;
	var userCart = req.body.cart;

	var q = "update users set email = $1, pass = $2, name = $3 where id = $4 RETURNING id,email,pass,name";
	var query = client.query(q, [userEmail,userPass,userName,userId]);
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
  	console.log("result: "+results);
  });
});


//delete users
app.delete('/delete_user', function(req, res){
	var userId = req.body.id;
	var userPass = req.body.pass;
	var userName = req.body.name;

	var q = "delete from users where id = $1 RETURNING id,email,pass,name";
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
  	console.log("result: "+results);
  });
});

//===================================================================//


//========================RESTful API for cart =====================//
//get cart
app.get('/get_cart', function (req,res){
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
  	console.log("result: "+results);
  });
});


//adding new cart
app.put('/addCart', function(req, res){
	var cartId = req.body.id;
	var cartUserId = req.body.userID;
	var cartBalance = req.body.balance;
	var cartItem = req.body.items;

	var q = "insert into cart (userid,balance,items) values ($1,$2,$3) RETURNING id,userID,balance,items";
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
  	console.log("result: "+results);
  });
});

//update cart items
app.post('/update_cart', function(req, res){
	var cartId = req.body.id;
	var cartUserId = req.body.userID;
	var cartBalance = req.body.balance;
	var cartItem = req.body.items;

	var q = "update cart set balance = $1, items = $2 where userID = $3 and id = $4";
	var query = client.query(q, [cartBalance,cartItem,cartUserId,cartId]);
	var results =[];

  //error handler for /update_cart
  query.on('error',function(){
  	res.status(500).send('Error, fail to update cart Id:'+cartId +' cartUserID: '+cartUserId+' items: '+cartItem);
  });

  //stream results back one row at a time
  query.on('row',function(row){
  	results.push(row);
  });

  //after all the data is returned close connection and return result
  query.on('end',function(){
  	res.json(results);
  	console.log("result: "+results);
  });
});


//delete cart from user
app.delete('/delete_cart', function(req, res){
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
  	console.log("result: "+results);
  });
});

//===================================================================//

//========================RESTful API for purchases =====================//
//get purchases
app.get('/get_purchases', function (req,res){
	var purchases_cartId = req.body.cartid;

	var query = client.query("select * from purchases");
	var results =[];

  //error handler for /get_purchases
  query.on('error',function(){
  	res.status(500).send('Error, fail to get purchases from cart cartID: '+purchases_cartId);
  });

  //stream results back one row at a time
  query.on('row',function(row){
  	results.push(row);
  });

  //After all data is returned, close connection and return results
  query.on('end',function(){
  	res.json(results);
  	console.log("result: "+results);
  });
});

//adding purchases
app.put('/add_purchases', function(req, res){
	var purchases_cartId = req.body.cartid;
	var purchasesName = req.body.name;
	var purchaseQuantity = req.body.quantity;
	var pruchasePrice = req.body.price;

	var q = "insert into purchases (cartid,name,quantity,price) values ($1,$2,$3,$4) RETURNING cartid,name,quantity,price";
	var query = client.query(q, [purchases_cartId,purchasesName,purchaseQuantity,pruchasePrice]);
	var results =[];

  //error handler for /add_purchases
  query.on('error',function(){
  	res.status(500).send('Error, fail to add to purchases Id:'+purchases_cartId +' items: '+purchasesName);
  });

  //stream results back one row at a time
  query.on('row',function(row){
  	results.push(row);
  });

  //after all the data is returned close connection and return result
  query.on('end',function(){
  	res.json(results);
  	console.log("result: "+results);
  });
});

//update purchase items
app.post('/update_purchase', function(req, res){
	var purchases_cartId = req.body.cartid;
	var purchasesName = req.body.name;
	var purchaseQuantity = req.body.quantity;
	var pruchasePrice = req.body.price;

	var q = "update purchases set quantity = $1 where cartid = $2 and name = $3";
	var query = client.query(q, [purchaseQuantity,purchases_cartId,purchasesName]);
	var results =[];

  //error handler for /update_purchases
  query.on('error',function(){
  	res.status(500).send('Error, fail to increment quantity:'+purchaseQuantity+' item: '+purchasesName);
  });

  //stream results back one row at a time
  query.on('row',function(row){
  	results.push(row);
  });

  //after all the data is returned close connection and return result
  query.on('end',function(){
  	res.json(results);
  	console.log("result: "+results);
  });
});

//delete purchase from cart
app.delete('/delete_purchase', function(req, res){
	var purchases_cartId = req.body.cartid;
	var purchasesName = req.body.name;
	var purchaseQuantity = req.body.quantity;
	var pruchasePrice = req.body.price;

	var q = "delete from purchases where name = $1 and cartid=$2";
	var query = client.query(q, [purchasesName,purchases_cartId]);
	var results =[];

  //error handler for /delete_cart
  query.on('error',function(){
  	res.status(500).send('Error, fail to delete purchases cartId:'+purchases_cartId +' items: '+purchasesName);
  });

  //stream results back one row at a time
  query.on('row',function(row){
  	results.push(row);
  });

  //after all the data is returned close connection and return result
  query.on('end',function(){
  	res.json(results);
  	console.log("result: "+results);
  });
});


//===================================================================//

//======================== Products =====================//

app.get('/collection/*', function(req, res) {
	var collection = req.originalUrl.replace('/collection/', '');

	query = client.query("SELECT * FROM products " +
		"where collection = '" + collection + "';");
	var results = [];
  // Stream results back one row at a time
  query.on('row', function(row) {
  	results.push(row);
  });

  // After all data is returned, close connection and return results
  query.on('end', function() {
  	resultsInJson = JSON.stringify(results);
  	res.render('products', { products: resultsInJson });
    // res.json(resultsInJson);
    console.log('Result: ' + resultsInJson);
});

  // res.render('products', {});
});

//===================================================================//

//======================== pages =====================//

app.get('/help', function(req, res) {
	res.render('help', {});
});

app.get('/index', function(req, res) {
	res.render('index', {});
});

app.get('/kart', function(req, res) {
	res.render('kart', {});
});

app.get('/kids1', function(req, res) {
	res.render('kids1', {});
});

app.get('/login', function(req, res) {
	res.render('login', {});
});

app.get('/men', function(req, res) {
	res.render('men', {});
});

app.get('/register', function(req, res) {
	res.render('register', {});
});

app.get('/women1', function(req, res) {
	res.render('women1', {});
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

