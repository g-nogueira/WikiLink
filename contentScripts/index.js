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
	var ppvAPI = popoverAPI(popover);
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

		popoverDB.watchChanges().then((oldV, newV) => {
			shortcut = newV.shortcut;
			popupMode = newV.popupMode;
			isPopoverEnabled = newV.isEnabled;
		});

		if (popupMode === 'shortcut') {
			document.addEventListener('keydown', onKeyDown)
			document.addEventListener('keyup', onKeyUp)
		}
		if (popupMode === 'default') {
			document.addEventListener('mouseup', onMouseUp);
		}
		wikilink.addEventListener('mouseenter', onMouseEnter);
		wikilink.addEventListener('mouseleave', onMouseLeave);


		function onMouseEnter(ev) {
			document.body.style.overflow = 'hidden';
		}

		function onMouseLeave(ev) {
			document.body.style.overflow = 'auto';
			setTimeout(() => ppvAPI.hideIt(), 300);
		}

		function onKeyDown(ev) {
			if (keyGroup.toString() === shortcut.toString()) {
				startProcess();
				keyGroup = [];
			}
			if (keyGroup.length < shortcut.length && !keyGroup.includes(ev.code)) {
				keyGroup.push(ev.code);
				onKeyDown(ev);
			}
		}

		function onKeyUp(ev) {
			var index = keyGroup.indexOf(ev.code);
			if (index !== -1) {
				keyGroup.splice(index, 1);
			}
		}

		function onMouseUp(ev) {
			if (ev.which === 1 && !ppvAPI.isPopoverChild(ev.target.id)) {
				startProcess();
			}
		}

	}


	function startProcess() {
		var wSelection = window.getSelection();
		var selection = wSelection.toString();
		var selContext = wSelection.focusNode.data;

		if (isPopoverEnabled && !selection.isCollapsed && !isEmptySelection(selection)) {

			var wiktionaryPromise = wiktionaryAPI.getTermDefinitions({ term: selection.toString() });
			var articlesListPromise = wikipediaAPI.getArticleList({ term: selection, range: selContext });

			Promise.all([wiktionaryPromise, articlesListPromise]).then(resp => {
				ppvAPI.insertDictionary(resp[0]);
				ppvAPI.insertArticleList({ list: resp[1] });

				ppvAPI.findElements('.js-item').forEach(article => {
					article.addEventListener('click', showArticle);
				});
			});

			ppvAPI.isWaiting({ area: 'articles' });
			ppvAPI.displayIt(wSelection, cals[0], cals[1]);
		}
	}

	function showArticle(ev) {
		let lang = ev.currentTarget.attributes.getNamedItem('lang').value;
		let id = ev.currentTarget.id;

		ppvAPI.isWaiting({ area: 'article' });

		wikipediaAPI.getArticleById({ pageId: id, imageSize: 250, lang: lang }).then(async resp => {
			ppvAPI.insertArticle({ article: resp.body, image: resp.image });

			var dictionary = await wiktionaryAPI.getTermDefinitions({ term: resp.title });
			ppvAPI.insertDictionary(dictionary);
		});

	}

	function appendOnBody(popover) {
		const div = document.createElement('div');
		const shadow = div.attachShadow({
			mode: 'open'
		});

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