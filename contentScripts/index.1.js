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

(async function() {
	"use strict";

	const popoverDB = require("../utils/StorageManager");
	const wikiAPI = require("../repository/WikipediaRepo");
	const wiktAPI = require("../repository/WiktionaryRepo");
	const selectionRepo = require("../repository/SelectionRepo");
	const Popover = require("../models/Popover");

	var popover = new Popover();
	var wikipediaAPI = wikiAPI;
	var wiktionaryAPI = wiktAPI;
	var config = {
		popoverEnabled: await popoverDB.retrieve('isEnabled'), // isPopoverEnabled
		keysTrigger: await popoverDB.retrieve('shortcut'), // shortcut
		popupMode: await popoverDB.retrieve('popupMode') // popupMode
	}
	var keyGroup = [];
	var selectedString = '';

	initDOMEvents();


	////////////////// IMPLEMENTATION //////////////////

	function initDOMEvents() {
		var timeOutId = null;

		popoverDB.onChanges((oldV, newV) => {
			config.keysTrigger = newV.shortcut;
			config.popupMode = newV.popupMode;
			config.popoverEnabled = newV.isEnabled;

			changePopupMode(newV.popupMode);
		});

		changePopupMode(config.popupMode);

		popover._shadowRootParent.addEventListener('mouseleave', onMouseLeave);
		popover._shadowRootParent.addEventListener('thumbclick', ev => loadArticle(ev.detail.article.lang, ev.detail.article.id))
		popover._shadowRootParent.addEventListener('tabselect', ev => loadWictionary(selectedString));

		function changePopupMode(popupMode) {
			if (popupMode === 'shortcut') {
				document.removeEventListener('mouseup', onMouseUp);
				document.addEventListener('keydown', onKeyDown)
				document.addEventListener('keyup', onKeyUp)
			} else if (popupMode === 'default') {
				document.addEventListener('mouseup', onMouseUp);
				document.removeEventListener('keydown', onKeyDown)
				document.removeEventListener('keyup', onKeyUp)
			}
		}

		function onMouseLeave(ev) {
			document.body.style.overflow = 'auto';
			popover.close();
		}

		function onKeyDown(ev) {

			clearTimeout(timeOutId);

			if (keyGroup.toString() === config.keysTrigger.toString()) {
				startProcess();
				keyGroup = [];
			} else if (keyGroup.length < config.keysTrigger.length && !keyGroup.includes(ev.code)) {
				keyGroup.push(ev.code);
				onKeyDown(ev);
			}
			// console.table(keyGroup);

			timeOutId = setTimeout(() => keyGroup = [], 10 * 1000);
		}

		function onKeyUp(ev) {
			var index = keyGroup.indexOf(ev.code);
			if (index !== -1) {
				keyGroup.splice(index, 1);
			}
		}

		function onMouseUp(ev) {
			if (ev.which === 1 && !popover.isChild(`#${ev.target.id}`)) {
				startProcess();
			}
		}

	}

	function startProcess() {
		var selection = selectionRepo.getSelectionString();
		var selContext = selectionRepo.getSelectionContext();

		if (config.popoverEnabled && !selection.isCollapsed && !selectionRepo.isSelectionEmpty()) {

			popover.showSearchList();
			wikipediaAPI.getPageList({ term: selection, range: selContext }).then(popover._insertThumbnails);
////////////////// PASED END //////////////////
			wiktionaryAPI.getDefinitions(selection.toString()).then(Popover.setDictionary);

			document.body.style.overflow = 'hidden';
			Popover.isLoading({ area: 'thumbnails' });
			Popover.render(selectionRepo.getSelection(), cals[0], cals[1]);
		}
	}

	function loadArticle(language, pageId) {
		Popover.isLoading({ area: 'article' });

		wikipediaAPI.getPageById({ pageId: pageId, imageSize: 250, language }).then(async article => {
			Popover.setArticle(article);
			loadWictionary(article.title);
		});
	}

	function loadWictionary(title) {
		wiktionaryAPI
			.getDefinitions(title)
			.then(resp => Popover.setDictionary(resp))
	}

	function appendOnBody(popover) {
		const div = document.createElement('div');
		const shadow = div.attachShadow({ mode: 'open' });

		div.classList.add('js-wikilink');
		shadow.appendChild(popover);
		document.body.appendChild(div);

		return shadow.querySelector('.js-popover');
	}

	function insertCals() {
		var cal1, cal2;
		cal1 = createCal('cal1');
		cal2 = createCal('cal2');
		document.body.appendChild(cal1);
		document.body.appendChild(cal2);


		function createCal(id) {
			return document.createRange().createContextualFragment(`<div id="${id}">&nbsp;</div>`);
		}

		return [document.querySelector('#cal1'), document.querySelector('#cal2')];
	}
}());