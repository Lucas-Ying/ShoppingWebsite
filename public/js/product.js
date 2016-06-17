$().ready(function(){

});

function addToCart(itemName, itemPrice, description, image) {
    var cartID = 0;
    var itemQuantity = 1;
    var registerName = document.getElementById('registration').text;
    var email = sessionStorage.getItem('useremail');
    console.log("Adding to cart, Email: " + email);
    console.log("Adding to cart, name: " + registerName);
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
                        "image": image
                    },
                    success: function (data) {
                        alert('Item added!');
                    },
                    error: function () {
                        console.log("Error, fail to get purchases.");
                    }
                });
            },
            error: function () {
                console.log("Error: fail to get userCart");
            }
        });
    } else {
        //default
        var defaultValue = 0;
        calculateTotal(defaultValue.toFixed(2));
    }
}