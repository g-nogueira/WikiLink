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
	const iframeUtils = require("./iframe");

	var popover = new iframeUtils();
	var isPopoverEnabled = await popoverDB.retrieve('isEnabled');
	var shortcut = await popoverDB.retrieve('shortcut');
	var popupMode = await popoverDB.retrieve('popupMode');
	var keyGroup = [];

	initDOMEvents();


	////////////////// IMPLEMENTATION //////////////////

	function initDOMEvents() {
		var wikilink = document.body.querySelector('.js-wikilink');
		var timeOutId = null;

		popoverDB.onChanges((oldV, newV) => {
			shortcut = newV.shortcut;
			popupMode = newV.popupMode;
			isPopoverEnabled = newV.isEnabled;

			changePopupMode(newV.popupMode);
		});

		changePopupMode(popupMode);

		wikilink.addEventListener('mouseleave', onMouseLeave);

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
		var selectionObj = window.getSelection();
		var selectionString = selectionObj.toString();

		if (isPopoverEnabled && !selectionString.isCollapsed && !isEmptySelection(selectionString)) {

			document.body.style.overflow = 'hidden';
			popover.show(selectionString, selectionObj);
		}
	}

	function isEmptySelection(selection) {
		//If given argument is not empty neither is white spaces
		return !(selection && /\S/.test(selection));
	}
}());