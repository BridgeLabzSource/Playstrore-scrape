
var express = require('express');
var path = require('path');
var cheerio = require('cheerio');
var request = require('request');
var bodyParser = require('body-parser');
var redis = require("redis"),
    client = redis.createClient();
var app = express();

//config--
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client')));
firebase = require('./firbase.js');

//post call
app.post('/game', function (req, res) {
    var url = req.body.url;
    // use Cheerio to make request for play Store search
    request({
        method: 'GET',
        url: 'https://play.google.com/store/search?q=' + url

    }, function (err, response, html, callback) {

        if (err) return console.error(err);

        // get the HTML body from google
        $ = cheerio.load(html);
        var href;
        var searchLink = [];
        $('a.card-click-target').each(function () {
            var a = $(this);
            href = a.attr('href');
            if (href && href.indexOf('/store/apps/details?id=') != -1) {
                searchLink.push({ key: href });

            }
        })


        //game link for seraching game detail
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
            var wordOfDay = [];
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


            /**
            *  give the status about game
            */
            var gameStatus = [];
            //retriving package name and converting into unique number
            var sp = searchLink[0].key.split('=')
            var final = sp[1].split('.')
            var pack = final[1];
            console.log(pack);
            var g = [];
            for (var i = 0; i < pack.length; i++) {
                g.push(pack.charCodeAt(i));
            }
            var s = '';
            s = s + g.slice(0, 2);
            var str2 = s.replace(/\,/g, "");
            console.log(str2);
            if (cat == 'sports') {
                client.exists(str2, function (err, reply) {
                    if (reply === 1) {
                        console.log('exists :-It is Sport game ');
                    } else {
                        console.log('doesn\'t exist:- It is Sport game ');
                        client.hset([str2, sp[1], "Is Sport game"], redis.print);
                    }
                });

            }
            else {
                client.exists(str2, function (err, reply) {
                    if (reply === 1) {
                        console.log('exists :-It is Not Sport game ');
                    } else {
                        console.log('doesn\'t exist :- It is Not Sport game');
                        client.hset([str2, sp[1], "It is Not Sport game"], redis.print);
                    }
                });


            }



            // //storing game details
            var gameRef = firebase.database().ref("Game/gameDetails");

            gameRef.once('value', function (snapshot) {
                if (!snapshot.hasChild(title)) {
                    console.log("That Game name not exists");
                    gameRef.child(title).set({
                        gameTitle: title,
                        Gametype: cat,
                        datePublished: pubdata,
                        fileSize: size,
                        description: des

                    });

                    gameRef.orderByChild('gameTitle').equalTo(title).on('child_added', function (data) {
                        var d = data.val();
                        res.send(d);
                        console.log("info", d);
                    })

                }

                else {
                    console.log("That Game name already exists");
                    var d = snapshot.val();
                    console.log("info", d[title]);
                    res.send(d[title]);
                }

            });
        });
    });
});
// start app on localhost port 3000
var port = process.env.PORT || 3002;
app.listen(port, function () {
    console.log('listening on port ' + port);
});