$().ready(function(){
    
    //only load when user is on /kart page
    if (window.location.pathname == '/kart') {
        var checker = false;
        var userId =0;
        var registerName = document.getElementById('registration').text;

        $.ajax({
            method:'GET',
            url:'/get_users',
            success: function(data){
                if(registerName =='REGISTRATION'){return;}
                //go through database check if email already exist
                for(i = 0; i<data.length; i++){
                    if(data[i].email == sessionStorage.getItem('useremail')){
                        checker = true;
                        //display user item here
                        userId = data[i].id; 
                        //console.log('found user');
                        break;
                    }
                }

                if(checker){
                    getKartID(userId);
                }
                else{
                    console.log("Error: user doesnt exists");
                }
            },
            error:function(){
                console.log("Error: fail to get users");
            }
        });
    }
});


//get kart to display the purchases item
function getKartID(userId){
    var kartId = "";
    var checkCart = false;
    $.ajax({
        method:'GET',
        url:'/get_cart',
        success: function(data){
            for(i = 0; i<data.length; i++){
                //if this user have a shopping cart then display the item 
                if(data[i].userid == userId){                               
                    kartId = data[i].id;
                    checkCart = true;
                    break;
                }
            }
        
            //found cart then display the items that belong to that cart
            if(checkCart){
                  displayItem(kartId);
            }else{
                //otherwise add a new shopping cart to the user
                $.ajax({
                    method:'PUT',
                    url:'/addCart',
                    dataType:'json',
                    data:{'userID':userId,"balance":0,"items":""},
                    success:function(){
                        console.log('new cart added');
                        location.href = 'index';
                    },
                    error:function(){
                        console.log("Error: fail to add cart");
                    }
                });
            }
        },
        error:function(){
            console.log("Error: fail to get cart");
        }
    });
}

//display items purchases by user
function displayItem(kartId){
    var subtotal = 0;
    var total = 0;
    var finalSubtotal = 0;
    var shipping = 30;
    $.ajax({
        method:'GET',
        url:'/get_purchases',
        success: function(data){
            for(i = 0; i<data.length; i++){
                if(data[i].cartid == kartId){
                    var product = data[i].name;
                    var cost = data[i].price;
                    var count = data[i].quantity;
                    subtotal = parseFloat(count)*parseFloat(cost);
                    finalSubtotal = parseFloat(finalSubtotal)+parseFloat(subtotal);

                    //display item
                    var row ="<tr>"
                    +"<td>"+product+"</td>"
                    +"<td class='quantity'><input class = 'count' type ='input' value="+count+"></input></td>" 
                    +"<td class='money'><span> $"+cost+"</span></td>"
                    +"<td class='money'><span> $"+subtotal+"</span></td>"
                    +"<td>remove button here</td>" 
                    +"</tr>"

                    $('#itemTable').append(row);
                }
            }
            total = parseFloat(finalSubtotal)+parseFloat(shipping);
            var endRow = "<tr>"
                    +"<td></td>"
                    +"<td></td>"
                    +"<td></td>" 
                    +"<td>Subtotal</td>"
                    +"<td><span class='chout'> $"+finalSubtotal+"</span></td>" 
                    +"</tr><tr>"
                    +"<td></td>"
                    +"<td></td>"
                    +"<td></td>" 
                    +"<td>Estimated shipping</td>"
                    +"<td><span class='chout'> $"+shipping+"</span></td>" 
                    +"</tr><tr>"
                    +"<td></td>"
                    +"<td></td>"
                    +"<td></td>" 
                    +"<td>Total</td>"
                    +"<td><span class='chout'> $"+total+"</span></td>" 
                    +"</tr>"

             $('#itemTable').append(endRow);

        }
    });
}


