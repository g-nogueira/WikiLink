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

	const shortcutHelper = require("../utils/Shortcut");
	const selectionHelper = require("../utils/Selection");
	const PopoverHelper = require("./Popover");
	const applicationSettings = new (require("../storageEntities/ApplicationSettings"));
	const userPreferences = new (require("../storageEntities/UserPreferences"));
	const storageHelper = new (require("../utils/Storage"));


	await applicationSettings.getAll();
	await userPreferences.getAll();
	let popoverInstance = new PopoverHelper();
	let userSettings = {
		isPopoverEnabled: userPreferences.list.filter((up) => up.label === "modal.isEnabled")[0].value,
		shortcut: userPreferences.list.filter((up) => up.label === "shortcuts.toggleModal")[0].value
	};


	// Initialize an iframe element and insert it into the DOM
	popoverInstance.init({
		iframeUrl: chrome.extension.getURL('pages/popoverGUI.html'),
		iframeStyle: applicationSettings.list.filter((el) => el.label === "modal.style")[0].value,
		shadowMode: applicationSettings.list.filter((el) => el.label === "modal.shadowMode")[0].value
	});
	popoverInstance.insertIframe();


	// Listen for the shortcut to be triggered

	shortcutHelper.shortcut = [userSettings.shortcut];
	shortcutHelper.addEventListener(shortcutHelper.events.shortcutMatch, onShortcutMatch);

	// Listen for changes on storage
	storageHelper.addEventListener(storageHelper.events.storageChange, onStorageChange);



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