/**
 * define require module
 */
var express = require('express'),
    path = require('path'),
    fs = require("fs"),
    cheerio = require('cheerio'),
    request = require('request'),
    bodyParser = require('body-parser'),
    redis = require('redis'),
    Promise = require("bluebird"),
    db = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true}),
    cors=require('cors'),
    app = express(),
    port = process.env.PORT || 3010,
    firebase = require('./firbase.js');

Promise.promisifyAll(require("redis"));

/**
 * configure app
 */
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, './client')));

/*
 * in this function getAppDetails
 * @param {String} --url
 * @return {String} --final
 */
app.post('/getAppDetails', function (req, res) {
    var url = req.body.url,
        hash = 5387;
    for (i = 0; i < url.length; i++) {
        char = url.charCodeAt(i);
        hash = ((hash << 5) + hash) + char;
    }
    var hashkey = hash.toString(),
        finalhkey = hashkey.substr(hashkey.length - 3, hashkey.length),
        cat,
        finalserchlinks = 'https://play.google.com/store/apps/details?id=' + url;
    console.log('searchLink - ', finalserchlinks);
    request({
        method: 'GET',
        url: finalserchlinks
    }, function (err, response, html, callback) {
        if (err) return console.error(err);
        $ = cheerio.load(html);
        var wordOfDay = [],
            main = $('.main-content'),
            t = main.find('.document-title'),
            info = main.find('.meta-info '),
            title = t.find('.id-app-title').text(),
            pubdata = info.find('[itemprop=datePublished]').text(),
            size = info.find('[itemprop=fileSize]').text(),
            des = [];
        $('p').each(function (i, elem) {
            des[i] = $(this).text();
        });
        console.log('description', des[0]);
        $('a.document-subtitle.category').filter(function () {
            var data = $(this);
            cat = data.children().first().text();
        })
        wordOfDay.push({
            gameTitle: title,
            Gametype: cat,
            datePublished: pubdata,
            fileSize: size,
            description: des[0],
        })
        db.hset([finalhkey, url, cat], redis.print);
        if (!des[0] == '') {
            /* storing game details to firbase */
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
                    /* Retriving data from firebase */
                    gameRef.orderByChild('key').equalTo(finalhkey).on('child_added', function (data) {
                        var d = data.val();
                        res.send(d);
                        console.log("info", d);
                    });
                } else {
                    console.log("That Game name already exists");
                    var d = snapshot.val();
                    console.log("info", d[finalhkey]);
                    res.send(d[finalhkey]);
                }

            });

        } else {
            console.log('Description Not prasent')
        }
    });
});

/*
 * in this search by gametype
 * @param {String} --url
 * @return {String} --final
 */
app.post('/getCatagoryType', function (req, res) {
    var url = req.body.url,
        hash = 5387;
    for (i = 0; i < url.length; i++) {
        char = url.charCodeAt(i);
        hash = ((hash << 5) + hash) + char;
    }
    var hashkey = hash.toString(),
        finalhkey = hashkey.substr(hashkey.length - 3, hashkey.length),
        finalserchlinks = 'https://play.google.com/store/apps/details?id=' + url,
        cat;

    request({
        method: 'GET',
        url: finalserchlinks
    }, function (err, response, html, callback) {
        if (err) return console.error(err);

        /* get the HTML body from google.com */
        $ = cheerio.load(html);
        var wordOfDay = [],
            main = $('.main-content'),
            t = main.find('.document-title'),
            info = main.find('.meta-info '),
            title = t.find('.id-app-title').text(),
            pubdata = info.find('[itemprop=datePublished]').text(),
            size = info.find('[itemprop=fileSize]').text(),
            ty,
            des = [];
        $('p').each(function (i, elem) {
            des[i] = $(this).text();
        });

        $('a.document-subtitle.category').filter(function () {
                var data = $(this),
                    href = data.attr('href');
                ty = href.split('/');
                console.log(ty[4])
                cat = data.children().first().text();
            })
            /* create an object */
        wordOfDay.push({
            gameTitle: title,
            Gametype: cat
        })
        var gameDes = [],
            slp = ty[4].split('_'),
            ty1 = slp[0],
            flag = false,
            final = [];
        if (ty1 == 'GAME') flag = true;
        var cato = 'Catageory=' + cat + "::" + "isGame=" + flag;
        db.hset([finalhkey, url, cato], redis.print);
        db.hgetAsync(finalhkey, url).then(function (data) {
            final.push({
                Catageory: cat,
                gameStatus: cato
            })
            res.send(final);
        })
    });
});

/**
 * listen port
 */
app.listen(port, function () {
    console.log('listening on port ' + port);
});
