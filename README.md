# Alexa-Latin-Proverbs

Now [available](https://www.amazon.com/dp/B07BNXYDH9/ref=sr_1_1?s=digital-skills&ie=UTF8&qid=1521995313&sr=1-1&keywords=latin+proverbs) as a free to enable skill.

The Latin Proverbs skill takes a random quote from [wikiquote](https://en.wikiquote.org/wiki/Latin_proverbs), reads the Latin with IPA translation, then reads the English translation.

This skill was designed more as an experiment with IPA dictated pronunciation for Latin. To that end, [this](https://developer.amazon.com/blogs/alexa/post/8ade6baf-0ac8-4611-9cb2-e2a470886634/how-to-use-phonemes-to-change-alexa-s-pronunciation) blog post was a great help in getting started, and [this](https://developer.amazon.com/docs/custom-skills/speech-synthesis-markup-language-ssml-reference.html) documentation shows what IPA characters are accepted. After the IPA transcription is made, it is wrapped in SSML with a `x-slow` rate of prosody. There are still some pronunciation tweaks to be made, but it sounds better than the otherwise English pronunciation.

If you wish to add to the list of quotes from which is chosen, just edit the [wikiquote](https://en.wikiquote.org/wiki/Latin_proverbs) page!