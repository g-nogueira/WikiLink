'use strict';

function messageHandler() {


    return {
        request: request
    }

    function request(termArg) {
        
        var term = termArg;
        
        return {
            getArticle: repoRequest,
            getArticles: listRequest,
            getImage: imgRequest,
            wiktionary: wiktRequest
        }


        async function repoRequest({pageId, imageSize, lang}) {

            if (pageId) {
                var params = {};
                params.pageId = pageId;
                params.lang = lang;
                params.imgSize = imageSize;

                return sendMessage('wikirepo', 'searchById', params);
            } else {
                var params = {}
                params.term = term;
                params.lang = await popoverDB.retrieve('fallbackLang');

                return sendMessage('wikirepo', 'searchTerm', params);
            }
        }

        async function listRequest(range) {
            var params = {}
            params.term = term;
            params.range = range;
            params.nlpLangs = await popoverDB.retrieve('nlpLangs');

            return sendMessage('wikirepo', 'searchTermList', params);
        }

        function imgRequest(size) {
            var params = {};
            params.term = term;
            params.size = size;

            return sendMessage('wikirepo', 'searchImage', params);
        }

        function wiktRequest(word) {
            var params = {};
            params.term = word || term;

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