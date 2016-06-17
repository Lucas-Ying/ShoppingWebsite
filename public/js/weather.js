$().ready(function() {
    $(function () {
        $.getJSON("http://ip-api.com/json/?callback=?",
            function (res) {
                sessionStorage.setItem('location', res.city);
                console.log("Set location to: " + sessionStorage.getItem('location'));
            }
        );
        $.getJSON("https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + sessionStorage.getItem('location') + "')&format=json&callback=?",
            function(res) {
                if (res !== null && res.query !== null && res.query.results !== null && res.query.results.channel.description !== 'Yahoo! Weather Error') {
                    var result = res.query.results.channel,
                        weather = {};

                    weather.title = result.item.title;
                    weather.temp = result.item.condition.temp;
                    weather.code = result.item.condition.code;
                    weather.todayCode = result.item.forecast[0].code;
                    weather.currently = result.item.condition.text;
                    weather.high = result.item.forecast[0].high;
                    weather.low = result.item.forecast[0].low;
                    weather.text = result.item.forecast[0].text;
                    weather.humidity = result.atmosphere.humidity;
                    weather.pressure = result.atmosphere.pressure;
                    weather.rising = result.atmosphere.rising;
                    weather.visibility = result.atmosphere.visibility;
                    weather.sunrise = result.astronomy.sunrise;
                    weather.sunset = result.astronomy.sunset;
                    weather.description = result.item.description;
                    weather.city = result.location.city;
                    weather.country = result.location.country;
                    weather.region = result.location.region;
                    weather.updated = result.item.pubDate;
                    weather.link = result.item.link;
                    weather.units = {
                        temp: result.units.temperature,
                        distance: result.units.distance,
                        pressure: result.units.pressure,
                        speed: result.units.speed
                    };

                    sessionStorage.setItem('weather', weather.text);
                    console.log("weather: " + sessionStorage.getItem('weather'));
                }
            }
        );
    });
});