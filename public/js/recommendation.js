$().ready(function() {
    var collection = sessionStorage.getItem('preference');
    var weather = sessionStorage.getItem('weather');

    //get recommendations
    recByCoAndWea(collection, weather);

    var recommendation = JSON.parse(sessionStorage.getItem('recommendation'));
    console.log("recommendations: "+ recommendation);

    displayRecommendation(recommendation);

    $('#addToCartRec1').on('click',function(){
        var itemName = recommendation[0].name;
        var itemPrice = recommendation[0].cost;
        var description = recommendation[0].description;
        var image = recommendation[0].image;
        var itemID = recommendation[0].productid;
        addToCart(itemName, itemPrice, description, image, itemID);
    });

    $('#addToCartRec2').on('click',function(){
        var itemName = recommendation[1].name;
        var itemPrice = recommendation[1].cost;
        var description = recommendation[1].description;
        var image = recommendation[1].image;
        var itemID = recommendation[1].productid;
        addToCart(itemName, itemPrice, description, image, itemID);
    });

});

function recByCoAndWea(collection, weather) {
    $.ajax({
        method: 'PUT',
        url: '/get_recommendation',
        dataType: 'json',
        data: {
            'collection': collection,
            'weather': weather
        },

        success: function (data) {
            sessionStorage.setItem('recommendation', JSON.stringify(data));
        },
        error: function () {
            recByWeather(weather);
        }
    });
}

function recByWeather(weather) {
    $.ajax({
        method: 'PUT',
        url: '/get_recommendation_weather',
        dataType: 'json',
        data: {
            'weather': weather
        },

        success: function (data) {
            sessionStorage.setItem('recommendation', JSON.stringify(data));
        },
        error: function () {
            recWithoutCoAndWea();
        }
    });
}

function recWithoutCoAndWea() {
    $.ajax({
        method: 'GET',
        url: '/get_recommendation_all',

        success: function (data) {
            sessionStorage.setItem('recommendation', JSON.stringify(data));
        },
        error: function () {
            console.log("Error: fail to get recommendation");
        }
    });
}

function displayRecommendation(recommendation) {
    if (recommendation[0]){
        document.getElementById('Rec1').style.visibility = 'visible';
        document.getElementById('img1').setAttribute('src', recommendation[0].image);
        document.getElementById('name1').innerHTML = "Name: "+recommendation[0].name;
        document.getElementById('itemID1').innerHTML = "Item ID: "+recommendation[0].productid;
        document.getElementById('price1').innerHTML = "Price: $"+recommendation[0].cost;
        document.getElementById('description1').innerHTML = "Description: "+recommendation[0].description;
    }
    if (recommendation[1]){
        document.getElementById('Rec2').style.visibility = 'visible';
        document.getElementById('img2').setAttribute('src', recommendation[1].image);
        document.getElementById('name2').innerHTML = "Name: "+recommendation[1].name;
        document.getElementById('itemID2').innerHTML = "Item ID: "+recommendation[1].productid;
        document.getElementById('price2').innerHTML = "Price: $"+recommendation[1].cost;
        document.getElementById('description2').innerHTML = "Description: "+recommendation[1].description;
    }
}

function addToCart(itemName, itemPrice, description, image, itemID) {
    var cartID = 0;
    var itemQuantity = 1;
    var registerName = document.getElementById('registration').text;
    var email = sessionStorage.getItem('useremail');
    //console.log(email);
    //console.log(registerName);
    //if email is not empty
    if (email) {
        if (registerName == 'REGISTRATION') {
            return;
        }
        $.ajax({
            method: 'PUT',
            url: '/get_userCart',
            dataType: 'json',
            data: {'email': email},

            success: function (data) {
                cartID = data[0].id;
                console.log(data[0].id);
                $.ajax({
                    method: 'PUT',
                    url: '/add_purchases',
                    dataType: 'json',
                    data: {
                        'cartid': cartID,
                        "name": itemName,
                        "quantity": itemQuantity,
                        "price": itemPrice,
                        "description": description,
                        "image": image,
                        "itemID": itemID
                    },
                    success: function (data) {
                        alert('Item added!');
                    },
                    error: function () {
                        console.log("Error, fail to add products to shopping cart.");
                    }
                });
            },
            error: function () {
                console.log("Error: fail to get userCart");
            }
        });
    } else {
        //default
        alert('Login before using shopping cart!')
    }
}
