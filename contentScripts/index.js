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
	popoverInstance.iframeUrl = chrome.extension.getURL('pages/popoverGUI.html');
	popoverInstance.iframeStyle = applicationSettings.list.filter((el) => el.label === "modal.style")[0].value;
	popoverInstance.shadowMode = applicationSettings.list.filter((el) => el.label === "modal.shadowMode")[0].value
	popoverInstance.insertIframe();


	// Listen for the shortcut to be triggered
	shortcutHelper.shortcut = [userSettings.shortcut];
	shortcutHelper.addEventListener(shortcutHelper.events.shortcutMatch, onShortcutMatch);

	// Listen for changes on storage
	storageHelper.addEventListener(storageHelper.events.storageChange, onStorageChange);

	popoverInstance.addEventListener(popoverInstance.events.focusOut, (ev) => popoverInstance.hide());


	/**
	 * Callback for when the user presses the shortcuts.toggleModal shortcut
	 *
	 * @param {Event} ev
	 */
	function onShortcutMatch(ev) {
		let selectionObj = selectionHelper.getSelection();
		let selectionString = selectionObj.toString();
		let iframePosition = selectionHelper.getOffsetBottomPosition(selectionObj);

		if (userSettings.isPopoverEnabled && !selectionString.isCollapsed && !selectionHelper.isEmpty(selectionString)) {
			popoverInstance.show(selectionString, iframePosition);
		}
	}

	/**
	 * Callback for when chrome.storage.sync changes
	 *
	 * @param {*} oldV
	 * @param {*} newV
	 */
	function onStorageChange(oldV, newV) {
		shortcut = newV.shortcut;
		userSettings.isPopoverEnabled = newV.isEnabled;
		popoverInstance.shortcut = shortcut;
	}

}());