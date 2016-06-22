$().ready(function() {
    if("geolocation" in navigator){
        navigator.geolocation.getCurrentPosition(function(position){
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            loadWeather(latitude + ',' + longitude);
        });
    }else{
        loadWeather("Wellington", "");
    }
});

function loadWeather(location, woeid){
    $.simpleWeather({
        location: location,
        woeid: woeid,
        unit: 'c',
        success: function(weather){
            sessionStorage.setItem('location', weather.city);
            sessionStorage.setItem('weather', weather.currently);
            sessionStorage.setItem('temperature', weather.temp);
            console.log("location: " + sessionStorage.getItem('location'));
            console.log("weather: " + sessionStorage.getItem('weather'));
            console.log("temperature: " + sessionStorage.getItem('temperature') + "℃");
        },
        error: function(error){

        }
    });
}