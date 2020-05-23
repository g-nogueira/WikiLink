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
	const PopoverHelper = require("./Popover");
	const applicationSettings = new (require("../storageEntities/ApplicationSettings"));


	applicationSettings.getAll();
	let popoverInstance = new PopoverHelper();
	let userSettings = {
		isPopoverEnabled: await storageHelper.retrieve('isEnabled'),
		shortcut: await storageHelper.retrieve('shortcut')
	};


	// Initialize an iframe element and insert it into the DOM
	popoverInstance.init({
		iframeUrl: chrome.extension.getURL('pages/popoverGUI.html'),
		iframeStyle: applicationSettings.list.filter((el) => el.label === "modal.style")[0],
		shadowMode: applicationSettings.list.filter((el) => el.label === "modal.shadowMode")[0]
	});
	popoverInstance.insertIframe();


	// Listen for the shortcut to be triggered
	shortcutHelper.init(userSettings.shortcut);
	shortcutHelper.addEventListener("shortcutMatch", onShortcutMatch);

	// Listen for changes on storage
	storageHelper.onChanges(onStorageChange);



	function onShortcutMatch(ev) {
		let selectionObj = selectionHelper.getSelection();
		let selectionString = selectionObj.toString();
		let iframePosition = selectionHelper.getOffsetBottomPosition(selectionObj);

		if (userSettings.isPopoverEnabled && !selectionString.isCollapsed && !isEmptySelection(selectionString)) {
			popoverInstance.show(selectionString, iframePosition);
		}
	}

	function onStorageChange(oldV, newV) {
		shortcut = newV.shortcut;
		userSettings.isPopoverEnabled = newV.isEnabled;
		popoverInstance.shortcut = shortcut;
	}

	function isEmptySelection(selection) {
		//If given argument is not empty neither is white spaces
		return !(selection && /\S/.test(selection));
	}

}());