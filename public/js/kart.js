$().ready(function(){
    
    //only load when user is on /kart page
    if (window.location.pathname == '/kart') {
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
        }else{
            //default
            var defaultValue = 0;
            calculateTotal(defaultValue.toFixed(2));
        }

        //remove button onclick remove the row from database
        $('.itemTable').on('click','.removebtn',function(){
            var currentItem = $(this).closest('tr');
            var productName = currentItem.find('.product').text();

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

        $('.itemTable').on('focus','.count',function(){  
            var itemName = $(this).closest('tr').find('.product').text();
            //get current values from table
            var price = $(this).closest('tr').find('.price').text().replace('$','');
            var subtotal =  $(this).closest('tr').find('.sub').text().replace('$','');
            var finalSubtotal = $('.itemTable').find('#finalSubtotal').text().replace('$','');
            var shipping = $('.itemTable').find('#shipping').text().replace('$','');
            var total = $('.itemTable').find('#total').text().replace('$','');

            finalSubtotal=finalSubtotal-subtotal;
            
            $(this).keyup(function(){
                var quantity = this.value;
                var newSubTotal = roundToTwo(price*quantity).toFixed(2);
                $(this).closest('tr').find('.sub').text('$'+newSubTotal);
                //update database
                $.ajax({
                    method:'POST',
                    url:'/update_purchase',
                    dataType:'json',
                    data:{'quantity': quantity, 'cartid':kartID,'name':itemName},

                    success: function(data){
                        //recalculate total cost and shippings
                        var newFinalSubTotal = roundToTwo(parseFloat(finalSubtotal)+parseFloat(newSubTotal)).toFixed(2);
                        var newShipping = roundToTwo(calculateShipping(newFinalSubTotal)).toFixed(2);
                        var newTotal = roundToTwo(parseFloat(newFinalSubTotal)+parseFloat(newShipping)).toFixed(2);
                        //rewrite total costs and shippings
                        $('.itemTable').find('#finalSubtotal').text('$'+newFinalSubTotal);
                        $('.itemTable').find('#shipping').text('$'+newShipping);
                        $('.itemTable').find('#total').text('$'+newTotal);

                    },
                    error: function(){
                        console.log("Error, fail to update database.");
                    }
                });

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
            if(data.length>=1){
                for(i = 0; i<data.length; i++){
                    if(data[i].cartid == kartId){
                        var product = data[i].name;
                        var cost = data[i].price;
                        var count = data[i].quantity;
                        var des = data[i].description;
                        var img = data[i].image;
                        subtotal = roundToTwo(count*cost).toFixed(2);
                        finalSubtotal = roundToTwo(parseFloat(finalSubtotal)+parseFloat(subtotal)).toFixed(2);

                        //display item
                        var row ="<tr class='items'>"
                        +"<td><div class='image'><img src='"+img+"' height='50' width ='50'/></div></td>"
                        +"<td class='name' id='name'>"
                        +"<span class='product'>"+product+"</span><p class='texts'>"+des+"</p>"
                        +"</td>"
                        +"<td class='quantity'><input class='count' type ='input' value="+count+"></input></td>" 
                        +"<td class='cost'><span class='price'> $"+cost+"</span></td>"
                        +"<td class='subtotal'><span class='sub'> $"+subtotal+"</span></td>"
                        +"<td class='rmbtn'><img src='/buttonImages/remove.png' width='20' height='20' class = 'removebtn' id ='removebtn' type ='submit'></td>" 
                        +"</tr>"

                        $('#itemTable').append(row);
                    }
                } 
            }else{
                //default
                var defaultValue = 0;
                calculateTotal(defaultValue.toFixed(2));
            }

            calculateTotal(finalSubtotal);
        },
        error: function(){
            console.log("Error, fail to get purchases.");
        }
    });
}

function calculateTotal(finalSubtotal){

    shipping = roundToTwo(calculateShipping(finalSubtotal)).toFixed(2);
    total = roundToTwo(parseFloat(finalSubtotal)+parseFloat(shipping)).toFixed(2);

    var endRow = "<tr>"
                    +"<td></td>"
                    +"<td></td>"
                    +"<td></td>"                   
                    +"<td colspan ='2'><span class ='costLabel'>Subtotal</span></td>"
                    +"<td><span class='chout' id='finalSubtotal'> $"+finalSubtotal+"</span></td>" 
                    +"</tr><tr>"
                    +"<td></td>"
                    +"<td></td>"
                    +"<td></td>"                     
                    +"<td colspan ='2'><span class ='costLabel'>Estimated shipping</span></td>"
                    +"<td><span class='chout' id='shipping'> $"+shipping+"</span></td>" 
                    +"</tr><tr>"
                    +"<td></td>"
                    +"<td></td>"
                    +"<td></td>"
                    +"<td colspan ='2'><span class ='costLabel'>Total</span></td>"
                    +"<td><span class='chout' id='total'> $"+total+"</span></td>" 
                    +"</tr><tr>"
                    +"<td class='btn' colspan ='6'>"
                    +"<a href='/index'><input class='Continue' id='Continue' type='submit' value='Continue Shopping'></input></a>"
                    +"<a href=''><input class='Checkout' id='Checkout' type='submit' value='Check Out'></input></a></td>"
                    +"</tr>"

    $('#itemTable').append(endRow);
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
