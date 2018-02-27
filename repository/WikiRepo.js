(async function () {
    'using strict';

    const franc = require('franc');
    const defaultLang = await manager.retrieve('language');

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.receiver === 'wikirepo') {
            wikiRepo[message.fnName](message.params)
                .then(resp => sendResponse(resp))

            return true;
        }
    });


    class WikiRepo {
        constructor() { }

        /**
         * @summary It searches a given term on wikipedia.
         * @param {String} term The term to be searched on wikipedia.
         * @returns {Promise.<object>} Returns a Promise that resolves to an object with title and body properties.
         */
        searchTerm(data) {
            const article = { title: '', body: '', url: '' };

            return new Promise(async (resolve, reject) => {
                
                let language = defaultLang;
                if (defaultLang === 'rel') {
                    language = identifyLanguage(data.range);
                }
                
                language = !language ? 'en' : language;

                const searchResponse = await http.get(`https://${language}.wikipedia.org/w/api.php?action=opensearch&search=${data.term}&limit=2&namespace=0&format=json`);
                const resultsArray = JSON.parse(searchResponse);

                const titles = resultsArray[1];
                const articles = resultsArray[2];
                const urls = resultsArray[3];

                // const image = await this.searchImage(titles[0]);
                try {
                    let index = 0;
                    //If the first article dosn't have the title in it, will get the second article
                    if (!articles[0].toLowerCase().includes(titles[0].toLowerCase()) || articles[0].length < 80) {
                        index = 1;
                    }
                    article.title = titles[index];
                    article.body = articles[index];
                    article.url = urls[index];
                } catch (error) {
                    console.warn(`Couldn't get an article for the term "${data.term}".`);
                }


                resolve(article);
            });
        }

        /**
         * @summary It searches an image on wikipedia by the given term.
         * @param {String} term The term to be searched on wikipedia.
         * @returns {Promise.<object>} Returns a promise that resolves to an object with url, width, and height properties.
         */
        searchImage(data) {
            return new Promise(async (resolve, reject) => {
                const imageInfo = {
                    url: '',
                    width: 250,
                    height: 250
                };
                try {
                    const resp = await http.get(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${data.term}&pithumbsize=250&format=json`);
                    const image = findKey(JSON.parse(resp), 'thumbnail');

                    imageInfo.url = image.source;
                    imageInfo.width = image.width;
                    imageInfo.height = image.height;

                    resolve(imageInfo);
                } catch (error) {
                    console.warn(`Couldn't get image for term "${data.term}"`);
                    resolve(imageInfo);
                }
            });
        }


    }

    function findKey(obj, key) {
        let result = {};
        Object.keys(obj).forEach(el => {
            if (el === key) {
                result = obj[el];
            }
            else if (typeof obj[el] == 'object') {
                result = findKey(obj[el], key);
            }
        });

        return result;
    }


    function identifyLanguage(extract) {
        const regexUTF8 = /([^\u0000-\u0040\u005B-\u0060\u007B-\u00BF\u02B0-\u036F\u00D7\u00F7\u2000-\u2BFF])+/g;
        const text = extract.match(regexUTF8).toString();
        const whitelist = ['por', 'eng', 'spa', 'deu', 'fra', 'ita', 'rus'];
        const francRes = franc(extract, { whitelist: whitelist });
        const languages = {
            por: 'pt', eng: 'en', spa: 'es', deu: 'de',
            fra: 'fr', ita: 'it', rus: 'ru'
        };


        return languages[francRes];
    }
    const wikiRepo = new WikiRepo();
})();
