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

	var popover = new Popover(wikiAPI, wiktAPI);
	var config = {
		popoverEnabled: await popoverDB.retrieve('isEnabled'), // isPopoverEnabled
		keysTrigger: await popoverDB.retrieve('shortcut'), // shortcut
		popupMode: await popoverDB.retrieve('popupMode') // popupMode
	}
	var keyGroup = [];

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

		popover._shadowRootParent.addEventListener('mouseleave', () => {
			document.body.style.overflow = 'auto';
			popover.close();
		});

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


		function onKeyDown(ev) {

			clearTimeout(timeOutId);

			if (keyGroup.toString() === config.keysTrigger.toString()) {
				executeSearch();
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
				executeSearch();
			}
		}

	}

	function executeSearch() {
		var selection = selectionRepo.getSelectionString();
		var selContext = selectionRepo.getSelectionContext();
		var selObject = selectionRepo.getSelection();

		if (config.popoverEnabled && !selection.isCollapsed && !selectionRepo.isSelectionEmpty()) {
			popover.open({ searchFor: selection, searchContext: selContext, selectionObject:  selObject});
		}
	}

}());