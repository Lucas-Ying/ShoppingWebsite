$().ready(function() {
    var collection = sessionStorage.getItem('preference');
    var weather = sessionStorage.getItem('weather');
    //if preference is not empty
    if (collection && weather) {
        console.log('do recommendation.');
        $.ajax({
            method: 'PUT',
            url: '/get_recommendation',
            dataType: 'json',
            data: {
                'collection': collection,
                'weather': weather
            },

            success: function (data) {
                console.log(JSON.stringify(data));
                sessionStorage.setItem('recommendation', JSON.stringify(data));
            },
            error: function () {
                console.log("Error: fail to get userCart");
            }
        });
    } else {
        console.log("Error: preference is empty.");
    }
});