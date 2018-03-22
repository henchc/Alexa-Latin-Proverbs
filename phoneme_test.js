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