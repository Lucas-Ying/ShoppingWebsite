$().ready(function(){
    $('.addToCart').on('click',function(e){
        var itemName = document.getElementById(e.target.id).getAttribute('itemName');
        var itemPrice = document.getElementById(e.target.id).getAttribute('itemPrice');
        var description = document.getElementById(e.target.id).getAttribute('itemDescription');
        var image = document.getElementById(e.target.id).getAttribute('itemImage');
        var itemID = document.getElementById(e.target.id).getAttribute('itemID');
        addToCart(itemName, itemPrice, description, image, itemID);

    });
});

function addToCart(itemName, itemPrice, description, image, itemID) {
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