/*
#### DOM manipulation, data input and output ####
@------------------------------------------------@
| It creates a div element at the displayed page |
| DOM, as well as two "cals", for padding sakes. |
| Gets the ranges of these elements and listen to|
| the onmouseup event, that gets the selected    |
| text, parses it and request data to the API.   |
| The response will be displayed into a popover. |
@------------------------------------------------@
*/

(async function () {
	"use strict";

	const popoverDB = require("../utils/StorageManager");
	const wikiAPI = require("../contentScripts/WikipediaAPI");
	const wiktAPI = require("../contentScripts/WiktionaryAPI");
	const popoverManager = require("../models/popoverManager");
	const popoverDesigner = require("../models/popoverDesigner");

	var element = popoverDesigner.getBasicShell();
	var popover = popoverManager(element);
	var wikipediaAPI = wikiAPI;
	var wiktionaryAPI = wiktAPI;
	var isPopoverEnabled = await popoverDB.retrieve('isEnabled');
	var selectedString = '';

	initDOMEvents();


	////////////////// IMPLEMENTATION //////////////////

	function initDOMEvents() {
		popover.addEventListener('thumbclick', ev => loadArticle(ev.detail.article.lang, ev.detail.article.id))
		popover.addEventListener('tabselect', ev => loadWictionary(selectedString));

		startProcess();
	}

	function startProcess() {
		var urlParams = new URLSearchParams(window.location.search);
		var title = urlParams.get('title');

		if (isPopoverEnabled && title) {

			popover.showPage('js-wikiSearches');
			selectedString = title;
			wikipediaAPI.getPageList({ term: title, range: title }).then(popover.setThumbnails);
			wiktionaryAPI.getDefinitions(title).then(popover.setDictionary);

			popover.isLoading({ area: 'thumbnails' });
		}
	}

	function loadArticle(language, pageId) {
		popover.isLoading({ area: 'article' });

		wikipediaAPI.getPageById({ pageId: pageId, imageSize: 250, language }).then(async article => {
			popover.setArticle(article);
			loadWictionary(article.title);
		});
	}

	function loadWictionary(title) {
		wiktionaryAPI
			.getDefinitions(title)
			.then(resp => popover.setDictionary(resp))
	}

}());