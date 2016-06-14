$().ready(function(){
    changeLoginName();

    //logo
    $('#Name').on('click',function(){
        location.href = 'index';
    });

    //login button
    $('#log-in').on('click',function(){
        //get the name/email of the login button
        var loginName = document.getElementById('log-in').text;
        if(loginName =='LOG IN'){
            location.href = 'login';
        }
        else if(loginName =='LOG OUT'){
            logout();
        }
    });

    //registeration button
    $('#registration').on('click',function(){
        var loginName = document.getElementById('registration').text;
        if(loginName!= 'REGISTRATION'){
            location.href = 'kart';    
        }
        else{
            location.href = 'register';
        }
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
                method:'PUT',
                url:'/get_user',
                dataType:'json',
                data:{'email':email},

                success: function(data){
                    //if email doesnt exist in database then add user
                    if(data[0] == 'undefined' || data[0] == null){
                        document.getElementById('err').style.visibility = 'hidden';
                        //if email doesnt exist add the user to the database
                        addUser();
                    }
                    else if(data[0].email == email){
                        document.getElementById('err').innerHTML="Email already exist please use a different email";
                        document.getElementById('err').style.visibility = 'visible'; 
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
                        addCart();
                    },
                    error:function(){
                        console.log("Error: fail to add user: "+name);
                    }
                });
            }

            function addCart(){
                var userid=0;
                $.ajax({
                    method:'PUT',
                    url:'/get_user',
                    dataType:'json',
                    data:{'email':email},

                    success: function(data){           
                        if(data[0].email == email){
                            userid = data[0].id;
                        }
                        
                        if(userid!=0){
                            //add cart
                            $.ajax({
                                method:'PUT',
                                url:'/addCart',
                                dataType:'json',
                                data:{'userID':userid,"balance":0,"items":""},

                                success:function(){
                                    console.log('new cart added');
                                    //redirect to homepage
                                    location.href = 'login';
                                    //reset form
                                    $('#signupForm').trigger('reset');
                                },
                                error:function(){
                                    console.log("Error: fail to add cart");
                                }
                            });
                        }
                    },
                    error:function(){
                        console.log("Error: fail to get users");
                    }
                });
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
                method:'PUT',
                url:'/get_user',
                dataType:'json',
                data:{'email':email},

                success: function(data){
                    if(data[0].email == email){
                        if(data[0].pass == passW){      
                            sessionStorage.setItem('useremail', data[0].email);
                            sessionStorage.setItem('username',data[0].name);
                            //console.log(sessionStorage.getItem('username'));
                            login();
                            location.href = 'index';
                            //reset form
                            $('#loginForm').trigger('reset');
                            return;
                        }
                        else{
                            document.getElementById('err').innerHTML="Incorrect password";
                            document.getElementById('err').style.visibility = 'visible';
                            return;
                            //console.log("Error: incorrect password");
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

    //only check idle time when user is login
    if(sessionStorage.getItem('useremail')){
        var idletime = 0;
        var idleInterval = setInterval(idleTimer,60000);//1 minute

        $(this).mousemove(function(e){
            idletime = 0;
        });
        $(this).keypress(function(e){
            idletime = 0;
        });

        //timer for login
        function idleTimer(){
            idletime++;
            //if user has been idle for 30 minutes auto logout
            if(idletime > 29){
                logout();
            }
        }
    }
    
    /*$('#fbLogin').on('click',function(){
        OauthLogin();
    });

    $('#googleLogin').on('click',function(){
        OauthLogin();
    });*/
    //if (window.location.pathname == '/#_=_' || window.location.pathname == '/#' ) {
        //call this function after window is load 
        $(window).bind("load",function(){
            $.ajax({
                method:'GET',
                url:'/get_OAuth',
                dataType:'json',

                success: function(data){
                    console.log(data);
                    console.log(data.name+" : "+data.email);

                    var username = data.name;
                    var useremail = data.email;

                    if(username && useremail){
                        sessionStorage.setItem('useremail', useremail);
                        sessionStorage.setItem('username', username);
                        login();
                    }
                },
                error:function(){
                    console.log("Error: fail to get users");
                }
            });
        });
    //}

});

//user name display
function changeLoginName(){
    //if sessionstorage is not empty
    if(sessionStorage.getItem('useremail')){
        document.getElementById('registration').innerHTML=sessionStorage.getItem('username');
        document.getElementById('log-in').innerHTML='LOG OUT';
    }else{
        document.getElementById('registration').innerHTML='REGISTRATION';
        document.getElementById('log-in').innerHTML='LOG IN';
    }
}


//logout function
function logout(){
    sessionStorage.setItem('useremail', "");
    sessionStorage.setItem('username', "");
    changeLoginName();
    $.ajax({
        method:'PUT',
        url:'/OAuth_Logout',
        dataType:'json',

        success: function(data){
            console.log("user has logout");
        },
        error:function(){
            console.log("Error: fail to get users");
        }
    });
    
    location.href = 'login';
}

//login function
function login(){
    changeLoginName();
    alert("Login Successful!");
}

