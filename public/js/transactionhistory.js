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
                sessionStorage.setItem('history', JSON.stringify(data));
            },
            error: function () {
                console.log("Error: fail to get userCart");
            }
        });
    } else {
        //default
        var defaultValue = 0;
        calculateTotal(defaultValue.toFixed(2));
    }
});