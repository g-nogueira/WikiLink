(async function () {
    'using strict';

    const defaultLang = await manager.retrieve('language');

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.receiver === 'wiktrepo') {
            wiktRepo[message.fnName](message.params)
                .then(resp => sendResponse(resp))
            return true;
        }
    });


    class WiktRepo {
        constructor() { }

        /**
         * @summary It searches a given term on wikipedia.
         * @param {String} term The term to be searched on wikipedia.
         * @returns {Promise.<object>} Returns a Promise that resolves to an object with title and body properties.
         */
        searchTerm(data) {
            const definition = {};

            return new Promise(async (resolve, reject) => {

                const wikt = await http.get(`https://en.wiktionary.org/api/rest_v1/page/definition/${data.term}`);
                // const wikt = await http.get(`http://appservice.wmflabs.org/${language}.wiktionary.org/v1/page/definition/${data.term}`);
                const response = JSON.parse(wikt);

                resolve(response);
            });
        }
    }
    const wiktRepo = new WiktRepo();
})();
