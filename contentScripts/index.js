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

	const storageHelper = require("../utils/Storage");
	const shortcutHelper = require("../utils/Shortcut");
	const selectionHelper = require("../utils/Selection");
	const popoverHelper = require("./Popover");

	var isPopoverEnabled = await storageHelper.retrieve('isEnabled');
	var shortcut = await storageHelper.retrieve('shortcut');
	var popoverInstance = new popoverHelper();

	popoverInstance.init({
		iframeUrl: chrome.extension.getURL('pages/popoverGUI.html'),
		iframeWidth: 501,
		iframeHeight: 276,
		shadowMode: "open"
	});
	popoverInstance.insertIframe();

	shortcutHelper.startShortcutListener(shortcut);
	shortcutHelper.addEventListener("shortcutMatch", ev => {
		let selectionObj = selectionHelper.getSelection();
		let selectionString = selectionObj.toString();
		let iframePosition = selectionHelper.getOffsetBottomCoordinates(selectionObj);

		if (isPopoverEnabled && !selectionString.isCollapsed && !isEmptySelection(selectionString)) {

			popoverInstance.show(selectionString, iframePosition);
		}
	});

	storageHelper.onChanges((oldV, newV) => {
		shortcut = newV.shortcut;
		isPopoverEnabled = newV.isEnabled;
		popoverInstance.shortcut = shortcut;
	});



	////////////////// IMPLEMENTATION //////////////////

	function isEmptySelection(selection) {
		//If given argument is not empty neither is white spaces
		return !(selection && /\S/.test(selection));
	}
}());