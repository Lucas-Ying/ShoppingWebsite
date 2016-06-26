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
            location.href = '/login';
        }
        else if(loginName =='LOGOUT'){
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
            location.href = '/register';
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
                        addCart(email);
                        alert("SignUp Successful!");
                        //redirect to login page
                        location.href = 'login';
                    },
                    error:function(){
                        console.log("Error: fail to add user: "+name);
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
                	if(typeof data[0] != 'undefined')
                	{
                    	if(data[0].email == email){
                        	if(data[0].pass == passW){      
                            sessionStorage.setItem('useremail', data[0].email);
                            sessionStorage.setItem('username',data[0].name);
                            //console.log(sessionStorage.getItem('username'));
                            changeLoginName();
                            alert("Login Successful!");
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
                    alert("Please enter a valid email address");
                    document.getElementById('err').innerHTML="Email doesn't exists";
                    document.getElementById('err').style.visibility = 'visible';
                }
                alert("Please enter a valid email address");
                },
                error:function(){
                	alert("Please enter a valid email address");
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

    //facebook and google user display 
    if(window.location.pathname == '/' ) {
        $.ajax({
            method:'GET',
            url:'/get_OAuth',
            dataType:'json',

            success: function(data){                   
              //console.log("--------------------" + data.name+" : "+data.email);
                var username = data.name;
                var useremail = data.email;


                if(!sessionStorage.getItem('useremail')){
                    if(username && useremail){
                        sessionStorage.setItem('useremail', useremail);
                        sessionStorage.setItem('username', username);

                        //add user cart if user dont have it
                        checkUserCart(useremail);
                        //display username on page
                        changeLoginName();
                    }
                }
            },
            error:function(){
                console.log("Error: fail to get users");
            }
        });
    }

});

//user name display
function changeLoginName(){
    //if sessionstorage is not empty
    // console.log("email: " + sessionStorage.getItem('useremail') + " oauthemail: " + sessionStorage.getItem('OAUTHemail'))
    if(sessionStorage.getItem('useremail')){
    	console.log('changing text');
        document.getElementById('registration').innerHTML=sessionStorage.getItem('username');
        document.getElementById('log-in').innerHTML='LOG OUT';
        document.getElementById('log-in').innerHTML='LOGOUT';
    }
    else{
        document.getElementById('registration').innerHTML='REGISTRATION';
        document.getElementById('log-in').innerHTML='LOG IN';
    }
}


//logout function
function logout(){
    sessionStorage.setItem('useremail', "");
    sessionStorage.setItem('username', "");
    // sessionStorage.setItem('OAUTHuser', "");
    // sessionstorage.setItem('OAUTHemail', "");
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

//check and see if user cart exist before adding
function checkUserCart(useremail){
    $.ajax({
        method:'PUT',
        url:'/get_userCart',
        dataType:'json',
        data:{'email':useremail},

        success: function(data){
            //call add cart function if user dont have cart
            if(!data.id){
                addCart(useremail);
            }
        },
        error:function(){
            console.log("Error: fail to get userCart");
        }
    });
}

//addCart
function addCart(userEmail){
    var userid=0;
    $.ajax({
        method:'PUT',
        url:'/get_user',
        dataType:'json',
        data:{'email':userEmail},

        success: function(data){           
            if(data[0].email == userEmail){
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


