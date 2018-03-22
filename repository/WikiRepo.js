(async function () {
    'use strict';

    const franc = require('franc');

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.receiver === 'wikirepo') {

            wikiRepo[message.fnName](message.params)
                .then(resp => sendResponse(resp))

            return true; //It returns true to indicate that this is an async function.
        }
    });


    /**
     * Executes wikipedia calls for articles or images of given words
     * and returns a promise that resolves to an object with the response.
     */
    class WikiRepo {
        constructor() { }

        /**
         * It searches a given term on wikipedia.
         * @param {object} data The respective params to be passed.
         * @param {string} [data.language = 'rel'] The default language to be used. If undefined, 'rel'.
         * @param {string} data.term The term to be searched.
         * @param {string} [data.range = ''] The context to detect the language.
         * @returns {Promise.<object>} Returns a Promise that resolves to an object with title and body properties.
         */
        searchTerm({ range = '', term, language = 'rel' }) {
            return new Promise(async (resolve, reject) => {

                const lang = language === 'rel' ? identifyLanguage(range) : language;
                const searchResponse = await http.get(`https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${term}&limit=2&namespace=0&format=json`);

                try { //⚠ This area still needs to be improved.
                    const parsedResponse = JSON.parse(searchResponse);
                    const titles = parsedResponse[1];
                    const articles = parsedResponse[2];
                    const urls = parsedResponse[3];
                    let index = 0;

                    //If the first article dosn't have the title in it, will get the second article
                    if (!articles[0].toLowerCase().includes(titles[0].toLowerCase())
                        || articles[0].length < 80) {
                        index = 1;
                    }

                    let response = {};
                    response.title = titles[index];
                    response.body = articles[index];
                    response.url = urls[index];

                    resolve(response);

                } catch (error) {

                    let response = {};
                    response.title = '';
                    response.body = `Couldn't get an article for the term "${term}".`;
                    response.url = '';

                    resolve(response);
                }
            });
        }

        /**
         * Searches an image on wikipedia by the given term.
         * @param {object} obj The object containing the parameters.
         * @param {String} obj.term The term to be searched on wikipedia.
         * @returns {Promise.<object>} Returns a promise that resolves to an object with url, width, and height properties.
         */
        searchImage({ term }) {
            return new Promise(async (resolve, reject) => {
                try {
                    const resp = await http.get(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${term}&pithumbsize=250&format=json`);

                    const responseFinder = keyFinder(JSON.parse(resp));
                    let image = responseFinder.find('thumbnail');
                    let { source: url, width, height } = image; //Destructuring image var into vars.
                    let imageInfo = { url, width, height };

                    resolve(imageInfo);
                } catch (error) {

                    let imageInfo = {};
                    imageInfo.url = '';
                    imageInfo.width = 250;
                    imageInfo.height = 250;

                    resolve(imageInfo);
                    console.warn(`Couldn't get image for term "${term}"`);
                }
            });
        }
    }

    /**
     * @summary Deep searches given key in the given object.
     * @param {object} obj The object to be deep searched.
     */
    function keyFinder(obj) {

        var objArg = obj;

        /**
         * 
         * @param {string} key The key to deep search in the object.
         */
        function keyToFind(key) {
            var result = {};

            Object.keys(obj).forEach(el => {
                if (el === key) {
                    result = obj[el];
                }
                else if (typeof obj[el] == 'object') {
                    result = keyFinder(obj[el]).find(key);
                }
            });

            return result;
        }

        return { find: keyToFind, obj: objArg};
    }

    /**
     * Identifies the language of given argument string. The default is english.
     * @param {string} extract The string to identify the language.
     */
    function identifyLanguage(extract) {
        const regexUTF8 = /([^\u0000-\u0040\u005B-\u0060\u007B-\u00BF\u02B0-\u036F\u00D7\u00F7\u2000-\u2BFF])+/g;
        const text = extract.match(regexUTF8).toString();
        const whitelist = ['por', 'eng', 'spa', 'rus'];
        const francRes = franc(extract, { whitelist: whitelist });
        const languages = {
            por: 'pt', eng: 'en', spa: 'es', rus: 'ru'
        };


        return languages[francRes] || 'en';
    }
    const wikiRepo = Object.freeze(new WikiRepo());
}());
