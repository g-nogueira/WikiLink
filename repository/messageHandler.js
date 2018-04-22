'use strict';

function messageHandler() {

    
    return {
        request: request
    }
    
    function request(term) {

        return {
            wikipedia: repoRequest,
            wikiList: listRequest,
            image: imgRequest,
            wiktionary: wiktRequest
        }


        async function repoRequest(range) {
            var params = {}
            params.term = term;
            params.range = range;
            params.language = await manager.retrieve('language');

            return sendMessage('wikirepo', 'searchTerm', params);
        }

        async function listRequest(range) {
            var params = {}
            params.term = term;
            params.range = range;
            params.language = await manager.retrieve('language');

            return sendMessage('wikirepo', 'searchTermList', params);
        }

        function imgRequest(size) {
            var params = {};
            params.term = term;
            params.size = size;

            return sendMessage('wikirepo', 'searchImage', params);
        }

        function wiktRequest(range) {
            var params = {};
            params.term = term;

            return sendMessage('wiktrepo', 'searchTerm', params);
        }

    }


    function sendMessage(receiver, functionName, params) {
        var msg = {};
        msg.receiver = receiver;
        msg.fnName = functionName;
        msg.params = params;

        return new Promise((resolve, reject) => chrome.runtime.sendMessage(msg, response => resolve(response)))
    }
}