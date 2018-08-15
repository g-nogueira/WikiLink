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

	var popover = appendOnBody(popoverDesigner.getBasicShell());
	var ppvAPI = popoverManager(popover);
	var cals = insertCals();
	var wikipediaAPI = wikiAPI;
	var wiktionaryAPI = wiktAPI;
	var isPopoverEnabled = await popoverDB.retrieve('isEnabled');
	var shortcut = await popoverDB.retrieve('shortcut');
	var popupMode = await popoverDB.retrieve('popupMode');
	var keyGroup = [];

	initDOMEvents();



	////////////////// IMPLEMENTATION //////////////////

	function initDOMEvents() {
		var wikilink = document.body.querySelector('.js-wikilink');
		var timeOutId = null;

		popoverDB.watchChanges().then((oldV, newV) => {
			shortcut = newV.shortcut;
			popupMode = newV.popupMode;
			isPopoverEnabled = newV.isEnabled;
		});

		if (popupMode === 'shortcut') {
			document.addEventListener('keydown', pushKeyToList)
			document.addEventListener('keyup', removeKeyFromList)
		} else if (popupMode === 'default') {
			document.addEventListener('mouseup', showPopup);
		}

		wikilink.addEventListener('mouseleave', hidePopup);

		popover.addEventListener('thumbclick', ev => loadArticle({ language: ev.detail.article.lang, pageId: ev.detail.article.id }));

		function hidePopup(ev) {
			document.body.style.overflow = 'auto';
			setTimeout(() => ppvAPI.hide(), 300);
		}

		function pushKeyToList(ev) {

			clearTimeout(timeOutId);

			if (keyGroup.toString() === shortcut.toString()) {
				startProcess();
				keyGroup = [];
			} else if (keyGroup.length < shortcut.length && !keyGroup.includes(ev.code)) {
				keyGroup.push(ev.code);
				pushKeyToList(ev);
			}
			console.table(keyGroup);

			timeOutId = setTimeout(() => keyGroup = [], 10 * 1000);
		}

		function removeKeyFromList(ev) {
			var index = keyGroup.indexOf(ev.code);
			if (index !== -1) {
				keyGroup.splice(index, 1);
			}
		}

		function showPopup(ev) {
			if (ev.which === 1 && !ppvAPI.isPopoverChild(`#${ev.target.id}`)) {
				startProcess();
			}
		}

	}

	function startProcess() {
		var wSelection = window.getSelection();
		var selection = wSelection.toString();
		var selContext = wSelection.focusNode.data;

		if (isPopoverEnabled && !selection.isCollapsed && !isEmptySelection(selection)) {

			ppvAPI.showPage('js-wikiSearches');

			wikipediaAPI.getArticleList({ term: selection, range: selContext }).then(ppvAPI.insertThumbnails);

			wiktionaryAPI.getDefinitions(selection.toString()).then(resp => {
				ppvAPI.insertDictionary(resp);
			});

			document.body.style.overflow = 'hidden';
			ppvAPI.loading({ area: 'thumbnails' });
			ppvAPI.render(wSelection, cals[0], cals[1]);
		}
	}

	function loadArticle({ language, pageId }) {
		ppvAPI.loading({ area: 'article' });

		wikipediaAPI.getArticleById({ pageId: pageId, imageSize: 250, language }).then(async article => {
			ppvAPI.insertArticle({ article: article.body, image: article.image });
			let dictionary = await wiktionaryAPI.getDefinitions(article.title);
			ppvAPI.insertDictionary(dictionary);
		});
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
			var calString = `<div id="${id}">&nbsp;</div>`;
			const cal = document.createRange().createContextualFragment(calString);
			return cal;
		}

		return [document.querySelector('#cal1'), document.querySelector('#cal2')];
	}

	function isEmptySelection(selection) {
		//If given argument is not empty neither is white spaces
		if (selection && /\S/.test(selection))
			return false;
		return true;
	}
}());