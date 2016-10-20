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
firebase=require('./firbase.js');
app.post('/game', function (req, res) {
    // allow access from other domains
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    var url = req.body.url;
console.log(url);
    // use Cheerio to make request for play Store search
    request({
        method: 'GET',
        url: 'https://play.google.com/store/search?q=' + url

    }, function (err, response, html, callback) {

        if (err) return console.error(err);
      var searchLink = [];
        // get the HTML body from google
        $ = cheerio.load(html);
        var href;
        $('a.card-click-target').each(function () {
            var a = $(this);
            href = a.attr('href');
            console.log(href)
            if (href && href.indexOf('/store/apps/details?id=') != -1) {
                searchLink.push({ key: href });

            }

console.log('key',searchLink[0].key)
        })
        var finalserchlinks = 'https://play.google.com' + searchLink[0].key;
        console.log('searchLink - ', finalserchlinks);
        // use Cheerio to make request for game details
        var cat;

        request({
            method: 'GET',
            url: finalserchlinks
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
            // console.log('Data', wordOfDay);
            res.send(JSON.stringify(wordOfDay));

 
// //storing game details
var gameRef = firebase.database().ref("Game/gameDetails");
gameRef.push({

        gameTitle: title, 
        Gametype: cat, 
        datePublished: pubdata, 
        fileSize: size, 
        description: des
    
});

// gameRef.orderByChild('gameTitle').equalTo(title).on(function(data){

// })
 });

      

    });



});

// start app on localhost port 3000
var port = process.env.PORT || 3002;
app.listen(port, function () {
    console.log('listening on port ' + port);
});