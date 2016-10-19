var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();
var wordOfDay = [];
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.get('/a', function (req, res) {
    // allow access from other domains
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    var cat;
    // use Cheerio to make request
    request({
        method: 'GET',
        url: 'https://play.google.com/store/apps/details?id=dk.tactile.discoducks&hl=en'
    }, function (err, response, html, callback) {
        if (err) return console.error(err);

        // get the HTML body from WordThink.com
        $ = cheerio.load(html);

        var main = $('.main-content')
        // getting game title class
        var t = main.find('.document-title');
        var info = main.find('.meta-info ');
        //getting game info
        var title = t.find('.id-app-title').text();
        //getting game info class
        var pubdata = info.find('[itemprop=datePublished]').text();
        var size = info.find('[itemprop=fileSize]').text();
        var des = main.find('[jsname=C4s9Ed]').text();
        $('a.document-subtitle.category').filter(function () {

            var data = $(this);
            cat = data.children().first().text();

        })
        // create an object
        wordOfDay.push({ gameTitle: title, Gametype: cat, datePublished: pubdata, fileSize: size, Info: des })

    });

    // return a JSON object as a response
    res.send(JSON.stringify(wordOfDay));
    console.log('Data', wordOfDay);
});

// start app on localhost port 3000
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('listening on port ' + port);
});