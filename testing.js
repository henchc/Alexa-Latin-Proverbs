'use strict';

// load packages
var https = require("https");
var cheerio = require("cheerio");

httpsGet((alexaSpeak, alexaCard) => {
        console.log("sent     : request");
        console.log("received to speak : " + alexaSpeak);
        console.log("received for card : " + alexaCard)
    }
);

function httpsGet(callback) {

    // url for wikiquote Latin proverbs
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

            // initiate proverb in case we get empty element
            var proverb = '';

            // until we get fillied italic element in the first li of a ul
            while (proverb.trim().length == 0) {

                // random index for all uls
                var randomIndex = Math.floor(Math.random()*$('ul').length);

                // assign proverb and translation
                proverb = $('ul').eq(randomIndex).find('li').first().find('i').first().text()
                var translation = $('ul').eq(randomIndex).find('li').eq(1).text()
            }

            // take out whatever comes before colon and the colon and space
            translation = translation.substring(translation.indexOf(':') + 1).trim()

            // trans proverb to IPA + SSML
            var latinIPA = transIPA(proverb.toLowerCase())

            // build speak and card text
            var alexaSpeak = latinIPA + ' ' + translation
            var alexaCard = "Proverb: " + proverb + '\n' + "English: " + translation

            callback(alexaSpeak, alexaCard)
        });
    });
    req.end();
}

function transIPA(latin) {

    // list of phonemes to translate
    // NOTE order matters in replace operation
    // some simplifications are made
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

    // repalce each pair in order
    var phonemeLatin = latin;
    for (var i = 0; i < phonemeList.length; i++) {
        var regex = new RegExp(phonemeList[i][0], 'g');
        phonemeLatin = phonemeLatin.replace(regex, phonemeList[i][1]);
    }

    // build SSML
    var phonemeSSML = '<phoneme alphabet="ipa" ph="' + phonemeLatin + '" />' + "<break time='1s'/>";

    return phonemeSSML
}
