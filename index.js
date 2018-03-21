'use strict';
var Alexa = require("alexa-sdk");
var https = require("https");
var cheerio = require("cheerio");

exports.handler = function(event, context) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        var openResponse = 'Please ask me to look up a word.';
        this.response.speak(openResponse);
        this.emit(':responseReady');
    },
    'LookupIntent': function () {
        var myRequest = ''
        for (var i = 0; i < Object.keys(this.event.request.intent.slots).length; i++) {
            var slotName = "Letter" + "A".repeat(i+1);
            if ("value" in this.event.request.intent.slots[slotName]) {
                myRequest += this.event.request.intent.slots[slotName].value.trim().charAt(0);
            }
        }

        myRequest = myRequest.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/ /g, '').toLowerCase()

        httpsGet(myRequest,  (myResult) => {
                console.log("sent     : " + myRequest);
                console.log("received : " + myResult);

                this.response.speak(myResult)
                    .cardRenderer(myRequest, myResult);
                this.emit(':responseReady');
            }
        );
    },
    'SessionEndedRequest' : function() {
        console.log('Session ended with reason: ' + this.event.request.reason);
    },
    'AMAZON.StopIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent' : function() {
        this.response.speak("Sorry, I didn't get that. You can try: 'Alexa, ask Latin Wiktionary to look up C. A. N. O.'");
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent' : function() {
        this.response.speak('Bye');
        this.emit(':responseReady');
    },
    'Unhandled' : function() {
        this.response.speak("Sorry, I didn't get that. You can try: 'Alexa, ask Latin Wiktionary to look up C. A. N. O.'");
    }
};

function httpsGet(userRequest, callback) {

    // build URL with page num
    var url = 'https://en.wiktionary.org/w/index.php?title=' + userRequest + '&printable=yes';

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
            var all = $('*');

            var latinIndex = 0;
            var parsePoss = [];
            var alexaText = '';
            all.each(function(i, elem) {

                if ($(this).text() == 'Latin' && $(this).hasClass('mw-headline') == true) {
                    latinIndex = i;
                }

                var pos = ['Verb',
                           'Noun',
                           'Pronoun',
                           'Adjective',
                           'Conjunction',
                           'Preposition',
                           'Participle',
                           'Supine',
                           'Interjection']

                if (latinIndex !=0 && pos.indexOf($(this).text()) != -1) {
                    var start = pos[pos.indexOf($(this).text())] + ': ';
                    alexaText += start;
                    alexaText += $(this).next().text();
                    alexaText += $(this).next().next().text();

                    if (alexaText.length != start.length) {
                        parsePoss.push(alexaText);
                        alexaText = '';
                    } else {
                        alexaText = '';
                    }
                }

                if (latinIndex != 0 && $(this).is('hr')) {
                    var stopRule = i;
                    return false
                }
            })

            var wordIPA = transIPA(userRequest)

            callback(buildText(parsePoss, wordIPA, userRequest));

        });
    });
    req.end();
}

function buildText(parsePoss, wordIPA, userRequest) {

    var alexaText = '';

    if (parsePoss.length == 0) {
        alexaText += 'Sorry, I could not find that word.';
    } else if (parsePoss.length == 1) {
        alexaText += '';
    } else if (parsePoss.length > 1) {
        alexaText += 'There are ' + parsePoss.length + ' possibilities.\n\n';
    }

    for (var j = 0; j < parsePoss.length ; j++) {
        alexaText += (j + 1) + ': \n';
        alexaText += parsePoss[j] + '\n';
    }

    var phonemeSSML = '<phoneme alphabet="ipa" ph="' + wordIPA + '" />' + "<break time='1s'/>";
    alexaText = phonemeSSML + alexaText;

    var regex = new RegExp(userRequest, 'g');
    alexaText = alexaText.replace(regex, phonemeSSML);

    return alexaText.trim();
}

function transIPA(word) {
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

    var phonemeWord = word;
    for (var i = 0; i < phonemeList.length; i++) {
        var regex = new RegExp(phonemeList[i][0], 'g');
        phonemeWord = phonemeWord.replace(regex, phonemeList[i][1]);
    }
    return phonemeWord
}
