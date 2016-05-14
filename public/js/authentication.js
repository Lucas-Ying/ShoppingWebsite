var ipAddress = "http://localhost:8080";

$(document).ready(function(){

    $('#signupForm').submit(function(e){
        e.preventDefault();
        
        var email = $('input[id="email"]').val();
        var pass = $('input[id="password"]').val();
        var name = $('input[id="username"]').val();
        var conPass = $('input[id="confirm_password"]').val();

        var checker = false;
        //console.log("email: "+email+ "password: "+pass+" name: "+name);
        //if all values are not empty then add the user to table
        if(email && pass && name && conPass){

             $.ajax({
                method:'GET',
                url:ipAddress+'/get_users',

                success: function(data){
                    //go through database check if email already exist 
                    for(i = 0; i<data.length; i++){                        
                        if(data[i].email == email){
                            checker = true;
                            document.getElementById('err').innerHTML="Email already exist please use a different email or login";
                            document.getElementById('err').style.visibility = 'visible';
                        } 
                    }
                    
                    if(!checker){
                        document.getElementById('err').style.visibility = 'hidden';
                        //if email doesnt exist add the user to the database
                        addUser();
                    }      
                }               
             });
            
            function addUser(){
                $.ajax({
                    method:'PUT',
                    url:ipAddress+'/add_user',
                    dataType:'json',
                    data:{'email':email,"pass":pass,"name":name},

                    success:function(){                    
                        alert("SignUp Successful!");
                        //do more. swap page etc

                    },
                    error:function(){
                        console.log("Error: fail to add user: "+name);
                    }

                });
                //reset form
                $('#signupForm').trigger('reset');
            }
        }
        //otherwise leave it to the form validation
    });

});
