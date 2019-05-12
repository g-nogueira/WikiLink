(() => {
    const wikiRepo = require("./WikipediaRepo");
	const wiktRepo = require("./WiktionaryRepo");

    chrome.runtime.onMessage.addListener((request, sender, sendResponde) => {
        processRequest(request).then(sendResponde);
        return true;
    });

    async function processRequest(request) {
        let resp = {};

        if (request.provider === 'wp') {
            resp = await wikiRepo[request.request](request.args);
        } else if (request.provider === 'wt') {
            resp = await wiktRepo[request.request](request.args);
        }

        return resp;
    }
})();