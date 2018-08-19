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

	var element = popoverDesigner.getBasicShell(appendOnBody);
	var popover = popoverManager(element);
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

			changePopupMode(newV.popupMode);
		});

		changePopupMode(popupMode);

		wikilink.addEventListener('mouseleave', onMouseLeave);
		popover.addEventListener('thumbclick', ev => loadArticle(ev.detail.article.lang, ev.detail.article.id))

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
			popover.hide();
		}

		function onKeyDown(ev) {

			clearTimeout(timeOutId);

			if (keyGroup.toString() === shortcut.toString()) {
				startProcess();
				keyGroup = [];
			} else if (keyGroup.length < shortcut.length && !keyGroup.includes(ev.code)) {
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
		var wSelection = window.getSelection();
		var selection = wSelection.toString();
		var selContext = wSelection.focusNode.data;

		if (isPopoverEnabled && !selection.isCollapsed && !isEmptySelection(selection)) {

			popover.showPage('js-wikiSearches');

			wikipediaAPI.getArticleList({ term: selection, range: selContext }).then(popover.setThumbnails);
			wiktionaryAPI.getDefinitions(selection.toString()).then(popover.setDictionary);

			document.body.style.overflow = 'hidden';
			popover.isLoading({ area: 'thumbnails' });
			popover.render(wSelection, cals[0], cals[1]);
		}
	}

	function loadArticle(language, pageId) {
		popover.isLoading({ area: 'article' });

		wikipediaAPI.getArticleById({ pageId: pageId, imageSize: 250, language }).then(async article => {
			popover.setArticle(article);
			let dictionary = await wiktionaryAPI.getDefinitions(article.title);
			popover.setDictionary(dictionary);
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
			return document.createRange().createContextualFragment(`<div id="${id}">&nbsp;</div>`);
		}

		return [document.querySelector('#cal1'), document.querySelector('#cal2')];
	}

	function isEmptySelection(selection) {
		//If given argument is not empty neither is white spaces
		return !(selection && /\S/.test(selection));
	}
}());