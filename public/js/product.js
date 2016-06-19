$().ready(function(){
    $('#addToCart').on('click',function(){
        var itemName = document.getElementById('addToCart').getAttribute('itemName');
        var itemPrice = document.getElementById('addToCart').getAttribute('itemPrice');
        var description = document.getElementById('addToCart').getAttribute('itemDescription');
        var image = document.getElementById('addToCart').getAttribute('itemImage');
        addToCart(itemName, itemPrice, description, image);

    });
});

function addToCart(itemName, itemPrice, description, image) {
    var cartID = 0;
    var itemQuantity = 1;
    var registerName = document.getElementById('registration').text;
    var email = sessionStorage.getItem('useremail');
    console.log(email);
    console.log(registerName);
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