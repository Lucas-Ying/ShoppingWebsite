$().ready(function(){
    
    //only load when user is on /kart page
    if (window.location.pathname == '/kart' || window.location.pathname == '/kart#_=_' ) {
        //console.log('loading cart...');
        var kartID =0;
        var registerName = document.getElementById('registration').text;
        var email = sessionStorage.getItem('useremail');
        //if email is not empty
        if(email){
            if(registerName =='REGISTRATION'){return;}
            $.ajax({
                method:'PUT',
                url:'/get_userCart',
                dataType:'json',
                data:{'email':email},

                success: function(data){
                    kartID = data[0].id; 
                    //display user cart since one email can only have on usercart
                    displayItem(kartID);
                },
                error:function(){
                    console.log("Error: fail to get userCart");
                }
            });
        }

        $('.itemTable').on('click','.removebtn',function(){
            var productName = $(this).parent().parent().find('.product').text();
            var currentItem = $(this).closest('tr');

            $.ajax({
                method:'delete',
                url:'/delete_purchase',
                dataType:'json',
                data:{'name':productName, 'cartid': kartID},

                success: function(data){
                    //remove row if it has been deleted from database
                    currentItem.remove();
                    //reload table
                    $('#itemTable').find('tr:not(:first)').remove();
                    displayItem(kartID);

                },
                error: function(){
                    console.log("Error, fail to delete purchase(s).");
                }
            });
        });

        //checkout button onclick remove all items of the user
        $('.itemTable').on('click','.Checkout',function(){    
            $.ajax({
                method:'delete',
                url:'/checkout',
                dataType:'json',
                data:{'cartid': kartID},

                success: function(data){
                    //reload table
                    $('#itemTable').find('tr:not(:first)').remove();
                    displayItem(kartID);
                    alert("Checkout Successful!");
                },
                error: function(){
                    console.log("Error, fail to checkout.");
                }
            });

        });
    }
});

//display items purchases by user
function displayItem(kartId){
    var subtotal = 0;
    var total = 0;
    var finalSubtotal = 0;
    var shipping = 0;
    $.ajax({
        method:'GET',
        url:'/get_purchases',
        success: function(data){
            for(i = 0; i<data.length; i++){
                if(data[i].cartid == kartId){
                    var product = data[i].name;
                    var cost = data[i].price;
                    var count = data[i].quantity;
                    subtotal = roundToTwo(parseFloat(count)*parseFloat(cost)).toFixed(2);
                    finalSubtotal = roundToTwo(parseFloat(finalSubtotal)+parseFloat(subtotal)).toFixed(2);

                    //display item
                    var row ="<tr class='items'>"
                    +"<td><div class='image'><img src='' height='50' width ='50'/></div></td>"
                    +"<td class='name' id='name'>"
                    +"<span class='product'>"+product+"</span><p class='texts'>description</p>"
                    +"</td>"
                    +"<td class='quantity'><input class = 'count' type ='input' value="+count+"></input></td>" 
                    +"<td class='cost'><span> $"+cost+"</span></td>"
                    +"<td class='subtotal'><span> $"+subtotal+"</span></td>"
                    +"<td class='rmbtn'><img src='/buttonImages/remove.png' width='20' height='20' class = 'removebtn' id ='removebtn' type ='submit'></td>" 
                    +"</tr>"

                    $('#itemTable').append(row);
                }
            }
            shipping = roundToTwo(calculateShipping(finalSubtotal)).toFixed(2);
            total = roundToTwo(parseFloat(finalSubtotal)+parseFloat(shipping)).toFixed(2);
            var endRow = "<tr>"
                    +"<td></td>"
                    +"<td></td>"
                    +"<td></td>"                   
                    +"<td colspan ='2'><span class ='costLabel'>Subtotal</span></td>"
                    +"<td><span class='chout'> $"+finalSubtotal+"</span></td>" 
                    +"</tr><tr>"
                    +"<td></td>"
                    +"<td></td>"
                    +"<td></td>"                     
                    +"<td colspan ='2'><span class ='costLabel'>Estimated shipping</span></td>"
                    +"<td><span class='chout'> $"+shipping+"</span></td>" 
                    +"</tr><tr>"
                    +"<td></td>"
                    +"<td></td>"
                    +"<td></td>"
                    +"<td colspan ='2'><span class ='costLabel'>Total</span></td>"
                    +"<td><span class='chout'> $"+total+"</span></td>" 
                    +"</tr><tr>"
                    +"<td class='btn' colspan ='6'>"
                    +"<a href='/index'><input class='Continue' id='Continue' type='submit' value='Continue Shopping'></input></a>"
                    +"<a href=''><input class='Checkout' id='Checkout' type='submit' value='Check Out'></input></a></td>"
                    +"</tr>"
             $('#itemTable').append(endRow);
        }
    });

}

//round prices to 2 decimal place
function roundToTwo(num){
    return +(Math.round(num + "e+2")  + "e-2");
}

//calculate shipping
function calculateShipping(price){
    if(price<=25){
        return 0;
    }
    else{
        return price*10/100;
    }
}
