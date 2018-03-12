(async function () {
    'use strict';

    const defaultLang = await manager.retrieve('language');

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.receiver === 'wiktrepo') {

            wiktRepo[message.fnName](message.params)
                .then(resp => sendResponse(resp))
                
            return true; //It returns true to indicate that this is an async function.
        }
    });


    class WiktRepo {
        constructor() { }

        /**
         * @summary It searches a given term on wiktionary.
         * @param {String} obj.term The term to be searched on wiktionary.
         * @returns {Promise.<object>} Returns a Promise that resolves to an object with ....
         */
        searchTerm({term}) {
            const definition = {};

            return new Promise(async (resolve, reject) => {

                const wikt = await http.get(`https://en.wiktionary.org/api/rest_v1/page/definition/${term}`);
                // const wikt = await http.get(`http://appservice.wmflabs.org/${language}.wiktionary.org/v1/page/definition/${data.term}`);
                const response = JSON.parse(wikt);

                resolve(response);
            });
        }
    }
    const wiktRepo = new WiktRepo();
})();
