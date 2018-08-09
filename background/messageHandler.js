'use strict';

const wikiAPI = MessageHandler().wikiAPI();
const wiktAPI = MessageHandler().wiktAPI();

function MessageHandler() {

	return {
        wikiAPI: wikipediaAPI,
        wiktAPI: wiktionaryAPI
	}

	function wikipediaAPI() {

		return {
			getArticleById:getByiD,
            getArticleByTerm: getByTerm,
            getArticleList: getList,
			getImage: imgRequest,
		};


		async function getByiD({ pageId, imageSize, lang }) {

			var params = {};
			params.pageId = pageId;
			params.lang = lang;
			params.imgSize = imageSize;

			return sendMessage('wikirepo', 'searchById', params);
		}

		async function getByTerm({term}) {

			var params = {}
			params.term = term;
			params.lang = await popoverDB.retrieve('fallbackLang');

			return sendMessage('wikirepo', 'searchTerm', params);
		}

		async function getList({ term = '', range = '' }) {
			var params = {};
			params.term = term;
			params.range = range;
			params.nlpLangs = await popoverDB.retrieve('nlpLangs');

			return sendMessage('wikirepo', 'searchTermList', params);
		}

		function imgRequest({term, size}) {
			var params = {};
			params.term = term;
			params.size = size;

			return sendMessage('wikirepo', 'searchImage', params);
		}

    }
    
    function wiktionaryAPI() {

		return {
			getDefinitions: getDefinitions
		};


		function getDefinitions({term = ''}) {
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