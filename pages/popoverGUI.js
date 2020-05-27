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

	const userPreferences = new (require("../storageEntities/UserPreferences"));
	const wikiAPI = require("@g-nogueira/wikipediaapi");
	const wiktAPI = require("@g-nogueira/wiktionaryapi");
	const popoverManager = require("../models/popoverManager");
	const popoverDesigner = require("../models/popoverDesigner");

	var element = popoverDesigner.getBasicShell();
	var popover = popoverManager(element);
	var wikipediaAPI = wikiAPI;
	var wiktionaryAPI = wiktAPI;
	var isPopoverEnabled = await userPreferences.get("modal.isEnabled");
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
			wikipediaAPI.searchResults(title, "en").then(popover.setThumbnails);
			wiktionaryAPI.searchTitle(title, "en").then(popover.setDictionary);

			popover.isLoading({ area: 'thumbnails' });
		}
	}

	function loadArticle(language, pageId) {
		popover.isLoading({ area: 'article' });

		wikipediaAPI.getPageById(pageId, "en", 250).then((article) => {
			popover.setArticle(article);
			loadWictionary(article.title);
		});
	}

	function loadWictionary(title) {
		wiktionaryAPI
			.searchTitle(title, "en")
			.then(resp => popover.setDictionary(resp))
	}

}());