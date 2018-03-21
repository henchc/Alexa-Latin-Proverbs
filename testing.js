'use strict';

// load packages
var https = require("https");
var cheerio = require("cheerio");

// set first page of BTWB wods
var page = 1;

var myRequest = "2018-01-14"

httpsGet(myRequest,  page, (myResult) => {
        console.log("sent     : " + myRequest);
        console.log("received : " + myResult);
    }
);


////////
// make GET req to BTWB
function httpsGet(userRequest, page, callback) {

    // build URL with page num
    var url = 'https://en.wikiquote.org/wiki/Latin_proverbs';

    // make request
    var req = https.request(url, res => {
        res.setEncoding('utf8');
        var returnData = "";

        // save response to returnData
        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {

            // load page source to cheerio parser
            const $ = cheerio.load(returnData);

            var proverb = '';
            while (proverb.trim().length == 0) {
                var randomIndex = Math.floor(Math.random()*$('ul').length);
                var proverb = $('ul').eq(randomIndex).find('li').first().find('i').first().text()
                var translation = $('ul').eq(randomIndex).find('li').eq(1).text()
            }

            translation = translation.substring(translation.indexOf(':') + 1).trim()
            var latinIPA = transIPA(proverb)
            var alexaSpeak = latinIPA + ' ' + translation
            var alexaCard = proverb + '\n' + translation

            callback(alexaSpeak, alexaCard)
        });
    });
    req.end();
}

function transIPA(latin) {
    var phonemeList = [['ch', 'kʰ'],
                     ['qu', 'kʷ'],
                     ['ng', 'ŋ'],
                     ['ph', 'pʰ'],
                     ['th', 'tʰ'],
                     ['ae', 'ae̯'],
                     ['oe', 'oe̯'],
                     ['au', 'au̯'],
                     ['eu', 'eu̯'],
                     ['ui', 'ui̯'],
                     ['b', 'b'],
                     ['d', 'd'],
                     ['f', 'f'],
                     ['g', 'g'],
                     ['h', 'h'],
                     ['i', 'ɪ'],
                     ['c', 'k'],
                     ['k', 'k'],
                     ['l', 'l'],
                     ['m', 'm'],
                     ['n', 'n'],
                     ['p', 'p'],
                     ['r', 'r'],
                     ['s', 's'],
                     ['t', 't'],
                     ['z', 'z'],
                     ['a', 'aː'],
                     ['e', 'ɛ'],
                     ['o', 'oː'],
                     ['u', 'uː'],
                     ['y', 'ʏ']];

    var phonemeLatin = latin;
    for (var i = 0; i < phonemeList.length; i++) {
        var regex = new RegExp(phonemeList[i][0], 'g');
        phonemeLatin = phonemeLatin.replace(regex, phonemeList[i][1]);
    }

    var phonemeSSML = '<phoneme alphabet="ipa" ph="' + phonemeLatin + '" />' + "<break time='1s'/>";

    return phonemeSSML
}
