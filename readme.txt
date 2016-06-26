How to use the system:

Running it on the server:

https://tranquil-journey-51576.herokuapp.com/


Running it locally:

open Konsole and cd into the ShoppingWebsite directory.
Then run the following command:

node app.js

When "shoppingWebsite app listening on port:8080!" show up
Then open web browser and type in "http://localhost:8080/"

========================================================================
REST interface
Files:
app.js							-contains all the REST interface
	app.get('/auth/facebook')				-facebook authentication
	app.get('/auth/google')					-google authentication
	app.get('/logout')					-oauth logout
	app.get('/get_OAuth')					-gets users email and username
	app.put('/Oauth_Logout')				-set users email and username to default
	app.get('/')						-render main page
	app.get('/get_product')					-gets all the products from products table
	app.put('/add_product')					-insert new product into the products table 
	app.post('/update_product')	 			-update product from products table
	app.delete('delete_product')				-delete product from products table
	app.get('/get_users')					-gets all the users from users table
	app.put('/get_user')					-gets single user from users table
	app.put('/add_user')					-add a user to users table
	app.delete('/delete_user')				-delete a user from users table
	app.get('/get_cart')					-gets all the user cart from cart table
	app.put('/get_userCart')				-gets cart.id and user.email from the database
	app.put('/addCart')					-add new cart to cart table base on user id
	app.post('/update_cart')				-update item from cart table
	app.delete('/delete_cart')				-delete cart from cart table
	app.get('/get_purchases')				-gets all the purchases from purchases table
	app.put('/add_purchases')				-add new purchases into purchases table
	app.post('/update_purchase')				-update purchase from purchases table
	app.delete('/delete_purchase')				-delete purchase from purchases table
	app.delete('/checkout')					-remove all purhcases from purchases table base on user
	app.put('/get_purchases_by_cartid') 			-get purchases from purchases table base on cartid
	app.put('/add_transactions')				-add purchases into purchase_history
	app.put('/get_transactions')				-gets transactions purchase_history
	app.get('/get_recommendation_all')			-gets all the recommended products from purchases_history
	app.put('/get_recommendation_weather')			-get recommended products by weather
	app.put('/get_recommendation')				-get recommended products by weather and purchases_history
	app.get('/collection/*')				-gets all the products from products table base on collection
	app.put('/get_OAuth_user')				-get OAuth users base on email
	app.get('/help')					-render help page
	app.get('/index')					-render index page
	app.get('/kart')					-render kart page
	app.get('/kids1')					-render kid page
	app.get('/login')					-render login page
	app.get('/men')						-render men page
	app.get('/regsiter')					-render register page
	app.get('/women1')					-render women page

public/js/authentication.js				-contains all authentication information
         /form.js					-validate user input for login and register
         /kart.js					-display cart infomation base on user
         /product.js					-add product to user cart
         /recommendation.js				-use user purchases history and weather system to show recommend products
         /transactionhistory.js				-record transaction history
         /weather.js					-weather system

public/css/default.css 					-webpage style
		  /form.css 				-form style
		  /kart.css  				-kart style

views/							-all page display

========================================================================

Error handling:

Service Side:

GET: 		if fail to get the data from database there will be Error message 												showing in the console of the webpage.

PUT: 		if fail to add item, ajax call failed it will output an error message 			

POST: 		if fail to move item, ajax call failed it will ouput an error message

DELETE: 	if fail to delete item, ajax call failed it will ouput an error message	


Client side:

GET: 		if fail to get the data from database it will output an Error message 											"res.status(500).send('Error, ...');".

PUT: 		if fail to add item, ajax call failed it will output an error message 											"res.status(500).send('Error, ...');".

POST: 		if fail to move item, ajax call failed it will ouput an error message											"res.status(500).send('Error, ...');".

DELETE: 	if fail to delete item, ajax call failed it will ouput an error message	
				"res.status(500).send('Error, ...');".


========================================================================

Test cases for front­end and the test scripts for server­end of your web application:

curl commands.txt

========================================================================

Test cases for verifying the correct use of caching related HTTP headers and the corresponding test results:

caching Test cases.pdf

