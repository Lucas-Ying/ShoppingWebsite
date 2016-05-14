var ipAddress = "http://localhost:8080";

$(document).ready(function(){

    $('#signupForm').submit(function(e){
        e.preventDefault();

        //email,pass,name
        var email = $('input[id="email"]').val();
        var pass = $('input[id="password"]').val();
        var name = $('input[id="username"]').val();
        var conPass = $('input[id="confirm_password"]').val();

        //console.log("email: "+email+ "password: "+pass+" name: "+name);
        //if all values are not empty then add the user to table
        if(email && pass && name && conPass){
            $.ajax({
                method:'PUT',
                url:ipAddress+'/add_user',
                dataType:'json',
                data:{'email':email,"pass":pass,"name":name},

                success:function(){                    
                    alert("SignUp Successful!");
                    //reset form
                },
                error:function(){
                    console.log("Error: fail to add user: "+name);
                }

            });
            $('#signupForm').trigger('reset');
        }//otherwise leave it to the form validation
        //console.log("need more values");
    });

});
