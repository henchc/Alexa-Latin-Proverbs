'use strict';

// load packages
var Alexa = require("alexa-sdk");
var https = require("https");
var cheerio = require("cheerio");

exports.handler = function(event, context) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LatinProverbsIntent': function () {
        httpsGet((alexaSpeak, alexaCard) => {
                console.log("sent     : request");
                console.log("received to speak : " + alexaSpeak);
                console.log("received for card : " + alexaCard)

                this.response.speak(alexaSpeak)
                             .cardRenderer(alexaCard);
                this.emit(':responseReady');
            }
        );
    },
    'AMAZON.StopIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent' : function() {
        this.response.speak("You can try: 'alexa, tell me a latin proverb'");
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    }
};

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

            // remove punctuation and get list of words
            var proverbNoPunc = proverb.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim()
            var proverbWords = proverbNoPunc.split(/\s+/g)

            // built IPA SSML for each word
            var latinIPA = ''
            for (var i = 0; i < proverbWords.length; i++) {
                latinIPA += transIPA(proverbWords[i]);
            }

            latinIPA = '<prosody rate="slow">' + latinIPA + '</prosody>'

            // build speak and card text
            var alexaSpeak = latinIPA + " <break time='1s'/> " + translation
            var alexaCard = proverb + ' \n ' + "English: " + translation

            callback(alexaSpeak, alexaCard)
        });
    });
    req.end();
}

function transIPA(latin) {

    /**
    * list of phonemes to translate
    * NOTE order matters in replace operation
    * some simplifications are made
    * reference: https://developer.amazon.com/docs/custom-skills/speech-synthesis-markup-language-ssml-reference.html
    * reference: https://developer.amazon.com/blogs/alexa/post/8ade6baf-0ac8-4611-9cb2-e2a470886634/how-to-use-phonemes-to-change-alexa-s-pronunciation
    */

    var phonemeList = [[new RegExp('ch', 'g'), 'kh'],
                       [new RegExp('qu', 'g'), 'kw'],
                       [new RegExp('ng', 'g'), 'ŋ'],
                       [new RegExp('ph', 'g'), 'f'],
                       [new RegExp('th', 'g'), 'th'],
                       [new RegExp('ae', 'g'), 'aɪ'],
                       [new RegExp('oe', 'g'), 'ɔɪ'],
                       [new RegExp('au', 'g'), 'aʊ'],
                       [new RegExp('eu', 'g'), 'ɛu'],
                       [new RegExp('ui', 'g'), 'wi'],
                       [new RegExp('iu', 'g'), 'ju'],
                       [new RegExp('tio', 'g'), 'tsio'],
                       [new RegExp('b', 'g'), 'b'],
                       [new RegExp('d', 'g'), 'd'],
                       [new RegExp('f', 'g'), 'f'],
                       [new RegExp('g', 'g'), 'g'],
                       [new RegExp('h', 'g'), 'h'],
                       [new RegExp('([^w]|[^(ts)])i', 'g'), '$1ɪ'],
                       [new RegExp('c', 'g'), 'k'],
                       [new RegExp('k', 'g'), 'k'],
                       [new RegExp('l', 'g'), 'l'],
                       [new RegExp('m', 'g'), 'm'],
                       [new RegExp('n', 'g'), 'n'],
                       [new RegExp('p', 'g'), 'p'],
                       [new RegExp('r', 'g'), 'ɹ'],
                       [new RegExp('s', 'g'), 's'],
                       [new RegExp('t', 'g'), 't'],
                       [new RegExp('v', 'g'), 'w'],
                       [new RegExp('x', 'g'), 'ks'],
                       [new RegExp('z', 'g'), 'z'],
                       [new RegExp('a([^ɪʊ])', 'g'), 'aː$1'],
                       [new RegExp('e', 'g'), 'ɛ'],
                       [new RegExp('o', 'g'), 'oː'],
                       [new RegExp('([^ɛj])u', 'g'), '$1uː'],
                       [new RegExp('y', 'g'), 'ʏ']];

    // repalce each pair in order
    var phonemeLatin = latin;
    for (var i = 0; i < phonemeList.length; i++) {
        phonemeLatin = phonemeLatin.replace(phonemeList[i][0], phonemeList[i][1]);
        console.log(phonemeList[i][0])
        console.log(phonemeLatin)
        console.log('\n')
    }

    // build SSML
    var phonemeSSML = '<phoneme alphabet="ipa" ph="' + phonemeLatin + '" />';

    return phonemeSSML
}
