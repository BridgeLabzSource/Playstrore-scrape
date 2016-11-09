var express = require('express');
var path = require('path');
var fs = require("fs");
var cheerio = require('cheerio');
var request = require('request');
var bodyParser = require('body-parser');
var redis = require('redis');
var Promise = require("bluebird");
Promise.promisifyAll(require("redis"));
var db = redis.createClient();

var app = express();

//config--
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client')));
firebase = require('./firbase.js');

//post call
app.post('/getAppDetails', function (req, res) {
    var url = req.body.url;
    console.log(url)

    var hash = 5387;
    for (i = 0; i < url.length; i++) {
        char = url.charCodeAt(i);
        hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
    }
    //Retriving last four digits 
    var hashkey = hash.toString();
    var finalhkey = hashkey.substr(hashkey.length - 3, hashkey.length)
    console.log(finalhkey, 'j', hash)
  
    
    /*
             when u search by using game name not package  remove comments then
    */
    
    // use Cheerio to make request for play Store search
    //     request({
    //         method: 'GET',
    //         url: 'https://play.google.com/store/search?q=' + url

    //     }, function (err, response, html, callback) {

    //         if (err) return console.error(err);

    //         // get the HTML body from google
    //         $ = cheerio.load(html);
    //         var href;
    //         var searchLink = [];
    //         $('a.card-click-target').each(function () {
    //             var a = $(this);
    //             href = a.attr('href');
    //             if (href && href.indexOf('/store/apps/details?id=') != -1) {
    //                 searchLink.push({ key: href });

    //             }
    // })
    //       console.log(searchLink[0])

    //game link for seraching game detail
    var finalserchlinks = 'https://play.google.com/store/apps/details?id=' + url;
    console.log('searchLink - ', finalserchlinks);
    // use Cheerio to make request for game details
    var cat;

    request({  // 
        method: 'GET',
        url: finalserchlinks
    }, function (err, response, html, callback) {
        if (err) return console.error(err);

        // get the HTML body from google.com
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
        // var des = main.find('[jsname=C4s9Ed]').text();
        // var p=  $('[jsname=C4s9Ed]')
        // var des=p.find('p').text();
        var des = [];
        $('p').each(function (i, elem) {
            des[i] = $(this).text();

        });
        console.log('description', des[0]);


        $('a.document-subtitle.category').filter(function () {

            var data = $(this);
            cat = data.children().first().text();

        })
        // create an object
        wordOfDay.push({
            gameTitle: title,
            Gametype: cat,
            datePublished: pubdata,
            fileSize: size,
            description: des[0],
        })



        // Storing  data to redish
        db.hset([finalhkey, url, cat], redis.print);




        if (!des[0] == '') {
            // storing game details to firbase
            var gameRef = firebase.database().ref("Game/gameDetails");
            gameRef.once('value', function (snapshot) {
                if (!snapshot.hasChild(finalhkey)) {
                    console.log("That Game name not exists");
                    gameRef.child(finalhkey).set({
                        gameTitle: title,
                        Catageory: cat,
                        datePublished: pubdata,
                        fileSize: size,
                        description: des[0],
                        key: finalhkey,
                        package: hash,
                        package_name: url
                    });

                    // Retriving data from firebase
                    gameRef.orderByChild('key').equalTo(finalhkey).on('child_added', function (data) {
                        var d = data.val();
                        res.send(d);
                        console.log("info", d);
                    });

                }

                else {
                    console.log("That Game name already exists");
                    var d = snapshot.val();
                    console.log("info", d[finalhkey]);
                    res.send(d[finalhkey]);
                }

            });

        }
        else {
            console.log('Description Not prasent')
        }


    });
    // });
});

//post call for gametype
app.post('/getCatagoryType', function (req, res) {
    var url = req.body.url;
    console.log(url)

    var hash = 5387;
    for (i = 0; i < url.length; i++) {
        char = url.charCodeAt(i);
        hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
    }
    //Retriving last four digits 
    var hashkey = hash.toString();
    var finalhkey = hashkey.substr(hashkey.length - 3, hashkey.length)
    console.log(finalhkey, 'j', hash)

    // use Cheerio to make request for play Store search for game name
    //     request({
    //         method: 'GET',
    //         url: 'https://play.google.com/store/search?q=' + url

    //     }, function (err, response, html, callback) {

    //         if (err) return console.error(err);

    //         // get the HTML body from google
    //         $ = cheerio.load(html);
    //         var href;
    //         var searchLink = [];
    //         $('a.card-click-target').each(function () {
    //             var a = $(this);
    //             href = a.attr('href');
    //             if (href && href.indexOf('/store/apps/details?id=') != -1) {
    //                 searchLink.push({ key: href });

    //             }
    // })
    //       console.log(searchLink[0])

    //game link for seraching game detail
    var finalserchlinks = 'https://play.google.com/store/apps/details?id=' + url;
    console.log('searchLink - ', finalserchlinks);
    // use Cheerio to make request for game details
    var cat;

    request({  // 
        method: 'GET',
        url: finalserchlinks
    }, function (err, response, html, callback) {
        if (err) return console.error(err);

        // get the HTML body from google.com
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
        // var des = main.find('[jsname=C4s9Ed]').text();
        // var p=  $('[jsname=C4s9Ed]')
        // var des=p.find('p').text();
        var des = [];
        $('p').each(function (i, elem) {
            des[i] = $(this).text();

        });
        var ty;
        $('a.document-subtitle.category').filter(function () {

            var data = $(this);
            var href = data.attr('href');
            ty = href.split('/');
            console.log(ty[4])
            cat = data.children().first().text();

        })
        // create an object
        wordOfDay.push({
            gameTitle: title,
            Gametype: cat
        })
        // res.send(wordOfDay);
        var gameDes = [];
        var slp = ty[4].split('_');
        var ty1 = slp[0];
        var flag = false;
        var final=[];
        console.log(ty1)
        if (ty1 == 'GAME') flag = true;
        var cato = 'Catageory=' + cat + "::" + "isGame=" + flag;
        db.hset([finalhkey, url, cato], redis.print);
        db.hgetAsync(finalhkey, url).then(function (data) {
            final.push({Catageory:cat,gameStatus:cato})
            res.send(final);
        })

    });
    // });
});
// start app on localhost port 3000
var port = process.env.PORT || 3006;
app.listen(port, function () {
    console.log('listening on port ' + port);
});
