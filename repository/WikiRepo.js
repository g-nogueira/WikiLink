(async function () {
    'using strict';

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.module === 'wikiRepo') {
            wikiRepo[message.method](message.key, message.range)
                .then(resp => sendResponse(resp))
                .catch(err => sendResponse('Ocorreu algum erro ao pesquisar o termo' + message.key + '.'));
            return true;
        };
    });

    class WikiRepo {
        constructor() { }

        /**
         * @summary It searches a given term on wikipedia.
         * @param {String} term The term to be searched on wikipedia.
         * @returns {Promise.<object>} Returns a Promise that resolves to an object with title and body properties.
         */
        searchTerm(term, range) {
            const article = {title: '', body: ''};

            return new Promise(async (resolve, reject) => {

                let language = await http.get(`http://localhost:8081/?m=language&v=${range}`);
                language = JSON.parse(language).language === 'und'? 'en': JSON.parse(language).language;

                const searchResponse = await http.get(`https://${language}.wikipedia.org/w/api.php?action=opensearch&search=${term}&limit=2&namespace=0&format=json`);
                const resultsArray = JSON.parse(searchResponse);
                
                const titles = resultsArray[1];
                const articles = resultsArray[2];

                try {
                    article.title = titles[0];
                    article.body = articles[0].includes('refer to:')||articles[0].includes('referir-se a:') ? articles[1] : articles[0];
                } catch (error) {
                    console.warn(`Couldn't get an article for the term "${term}".`);
                }

                resolve(article);
            });
        }

        /**
         * @summary It searches an image on wikipedia by the given term.
         * @param {String} term The term to be searched on wikipedia.
         * @returns {Promise.<object>} Returns a promise that resolves to an object with url, width, and height properties.
         */
        searchImage(term) {
            return new Promise(async (resolve, reject) => {
                const imageInfo = {
                    url: '',
                    width: 500,
                    height: 500
                };
                try {
                    const imagesNameString = await http.get(`https://en.wikipedia.org/w/api.php?action=query&titles=${term}&prop=images&format=json`);
                    const imageTitle = JSON.parse(`{${/"images":\[(.*?)\]/g.exec(imagesNameString)[0]}}`).images[0].title;

                    const imageInfoString = await http.get(`https://commons.wikimedia.org/w/api.php?action=query&titles=${imageTitle}&prop=imageinfo&iiprop=url|size&format=json`);
                    const imageInfoObj = JSON.parse(`{${/"imageinfo":\[(.*?)\]/g.exec(imageInfoString)[0]}}`).imageinfo[0];

                    imageInfo.url = imageInfoObj.url;
                    imageInfo.width = imageInfoObj.width;
                    imageInfo.height = imageInfoObj.height;

                    resolve(imageInfo);
                } catch (error) {
                    console.warn(`Couldn't get image for term "${term}"`);
                    resolve(imageInfo);
                }
            });
        }
    }

    const wikiRepo = new WikiRepo();
})();
