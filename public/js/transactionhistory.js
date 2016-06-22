$().ready(function() {
    var registerName = document.getElementById('registration').text;
    var email = sessionStorage.getItem('useremail');
    //if email is not empty
    if (email) {
        if (registerName == 'REGISTRATION') {
            return;
        }
        $.ajax({
            method: 'PUT',
            url: '/get_transactions',
            dataType: 'json',
            data: {'email': email},

            success: function (data) {
                console.log(data[0].collection);
                sessionStorage.setItem('preference', data[0].collection);
                sessionStorage.setItem('history', JSON.stringify(data));
            },
            error: function () {
                console.log("Error: fail to get userCart");
            }
        });
    } else {
        console.log("Need to login to get recommendation");
    }
});