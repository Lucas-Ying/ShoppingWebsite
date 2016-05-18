var checkName = "";

function changeLoginName(checkName){
    if(checkName){
        document.getElementById('log-in').innerHTML=checkName;
    }
}

$().ready(function(){
    changeLoginName(checkName);
    
    //facebook login
    $('#fbLogin').on('click',function(){
        console.log("in fbLogin");
    });
    
    //signup
    $('#signupForm').submit(function(e){
        e.preventDefault();
        var email = $('input[id="email"]').val();
        var pass = $('input[id="password"]').val();
        var name = $('input[id="username"]').val();
        var conPass = $('input[id="confirm_password"]').val();

        $('#email').on('click',function(){
            document.getElementById('err').style.visibility = 'hidden';
        });

        var checker = false;
        //console.log("email: "+email+ "password: "+pass+" name: "+name);
        //if all values are not empty then add the user to table
        if(email && pass && name && conPass){
            //user can not use login as username
            if(name == "LOG IN"){
                document.getElementById('err').innerHTML="Can't use LOG IN as username, Please choose another username";
                document.getElementById('err').style.visibility = 'visible';
                return;
            }

            $.ajax({
                method:'GET',
                url:'/get_users',

                success: function(data){
                    //go through database check if email already exist
                    for(i = 0; i<data.length; i++){
                        if(data[i].email == email){
                            checker = true;
                            document.getElementById('err').innerHTML="Email already exist please use a different email";
                            document.getElementById('err').style.visibility = 'visible';
                        }
                    }

                    if(!checker){
                        document.getElementById('err').style.visibility = 'hidden';
                        //if email doesnt exist add the user to the database
                        addUser();
                    }
                },
                error:function(){
                    console.log("Error: fail to get users");
                }
            });

            function addUser(){
                $.ajax({
                    method:'PUT',
                    url:'/add_user',
                    dataType:'json',
                    data:{'email':email,"pass":pass,"name":name},

                    success:function(){
                        alert("SignUp Successful!");
                        location.href = 'login.html';
                        //do more. swap page etc

                    },
                    error:function(){
                        console.log("Error: fail to add user: "+name);
                    }
                });
                //reset form
                $('#signupForm').trigger('reset');
            }
        }//otherwise leave it to the form validation
    });


    //login
    $('#loginForm').submit(function(e){
        e.preventDefault();
        var email = $('input[id="email"]').val();
        var passW = $('input[id="password"]').val();


        $('#email,#password').on('click',function(){
            document.getElementById('err').style.visibility = 'hidden';
        });

        if(email && passW){
            //console.log("email: "+email+ "password: "+passW);
            $.ajax({
                method:'GET',
                url:'/get_users',

                success: function(data){
                    //go through database check if email exist
                    for(i = 0; i<data.length; i++){
                        if(data[i].email == email){
                            if(data[i].pass == passW){
                                location.href = 'index.html';
                               // checkName = data[i].name;
                               // changeLoginName(checkName);

                                alert("Login Successful!");
                                //document.getElementById('log-in').innerHTML = data[i].name;
                                //reset form
                                $('#loginForm').trigger('reset');
                                return;
                                //do something here
                            }
                            else{
                                document.getElementById('err').innerHTML="Incorrect password";
                                document.getElementById('err').style.visibility = 'visible';
                                return;
                                //console.log("Error: incorrect password");
                            }
                        }
                    }
                    document.getElementById('err').innerHTML="Email doesn't exists";
                    document.getElementById('err').style.visibility = 'visible';
                },
                error:function(){
                    console.log("Error: fail to get users");
                }
            });
        }

    });
});

