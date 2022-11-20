import { StorageManager } from "../utils/StorageManager";
import { Search } from "../utils/SearchManager";
import { popoverManager } from "../models/popoverManager";

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

	const popoverDesigner = require("../models/popoverDesigner");

	var element = popoverDesigner.getBasicShell(appendOnBody);
	var popover = popoverManager(element);
	var cals = insertCals();
	var isPopoverEnabled = await StorageManager.retrieve("isEnabled");
	var shortcut = await StorageManager.retrieve("shortcut");
	var popupMode = await StorageManager.retrieve("popupMode");
	var keyGroup : string[] = [];
	var selectedString = "";

	initDOMEvents();

	////////////////// IMPLEMENTATION //////////////////

	function initDOMEvents() {
		var wikilink = document.body.querySelector(".js-wikilink");
		var timeOutId: NodeJS.Timeout = null;

		StorageManager.onChanges((oldV, newV) => {
			shortcut = newV.shortcut;
			popupMode = newV.popupMode;
			isPopoverEnabled = newV.isEnabled;

			changePopupMode(newV.popupMode);
		});

		changePopupMode(popupMode);

		wikilink.addEventListener("mouseleave", onMouseLeave);
		popover.addEventListener("thumbclick", (ev : CustomEvent) => loadArticle(ev.detail.article.lang, ev.detail.article.id));
		popover.addEventListener("tabselect", (ev : CustomEvent) => loadWictionary(selectedString));

		function changePopupMode(popupMode : string) {
			if (popupMode === "shortcut") {
				document.removeEventListener("mouseup", onMouseUp);
				document.addEventListener("keydown", onKeyDown);
				document.addEventListener("keyup", onKeyUp);
			} else if (popupMode === "default") {
				document.addEventListener("mouseup", onMouseUp);
				document.removeEventListener("keydown", onKeyDown);
				document.removeEventListener("keyup", onKeyUp);
			}
		}

		function onMouseLeave(ev : MouseEvent) {
			document.body.style.overflow = "auto";
			popover.hide();
		}

		function onKeyDown(ev : KeyboardEvent) {
			clearTimeout(timeOutId);

			if (keyGroup.toString() === shortcut.toString()) {
				startProcess();
				keyGroup = [];
			} else if (keyGroup.length < shortcut.length && !keyGroup.includes(ev.code)) {
				keyGroup.push(ev.code);
				onKeyDown(ev);
			}
			// console.table(keyGroup);

			timeOutId = setTimeout(() => (keyGroup = []), 10 * 1000);
		}

		function onKeyUp(ev : KeyboardEvent) {
			var index = keyGroup.indexOf(ev.code);
			if (index !== -1) {
				keyGroup.splice(index, 1);
			}
		}

		function onMouseUp(ev : MouseEvent) {
			if (ev.which === 1 && !popover.isChild(`#${(ev.target as HTMLElement).id}`)) {
				startProcess();
			}
		}
	}

	/**
	 * Starts the process of showing the popup
	 */
	async function startProcess() {
		// Get the current selection
		var wSelection = window.getSelection();
		var selection = wSelection.toString();
		var selContext = (wSelection.focusNode as Text).data;

		selectedString = selection;

		// Popover enabled?
		if (isPopoverEnabled && !wSelection.isCollapsed && !isEmptySelection(selection)) {
			// Switch to tab 0
			popover.showPage("js-wikiSearches");

			// Show popup as loading
			document.body.style.overflow = "hidden";
			popover.isLoading({ area: "thumbnails" });
			popover.render(wSelection, cals[0], cals[1]);

			// Fetch search results async then show them
			Search.searchTerm(selection, selContext).then((result) => {
				popover.setThumbnails(result.pages);
				popover.setDictionary(result.definitions);
			});
		}
	}

	/**
	 * Shows a specific article in the popup.
	 * @param {string} language
	 * @param {string} pageId
	 */
	async function loadArticle(language : string, pageId : string) {
		popover.isLoading({ area: "article" });

		let article = await Search.getArticle(pageId, language);

		popover.setArticle(article);
		loadWictionary(article.title);
	}

	/**
	 * Shows a specific term definition in the popup
	 * @param {string} title
	 */
	async function loadWictionary(title : string) {
		let definition = await Search.getDefinitions(title);
		popover.setDictionary(definition);
	}

	function appendOnBody(popover : HTMLElement) {
		const div = document.createElement("div");
		const shadow = div.attachShadow({ mode: "open" });

		div.classList.add("js-wikilink");
		shadow.appendChild(popover);
		document.body.appendChild(div);

		return shadow.querySelector(".js-popover");
	}

	function insertCals() {
		var cal1, cal2;
		cal1 = createCal("cal1");
		cal2 = createCal("cal2");
		document.body.appendChild(cal1);
		document.body.appendChild(cal2);

		function createCal(id : string) {
			return document.createRange().createContextualFragment(`<div id="${id}">&nbsp;</div>`);
		}

		return [document.querySelector("#cal1"), document.querySelector("#cal2")];
	}

	function isEmptySelection(selection : string) {
		//If given argument is not empty neither is white spaces
		return !(selection && /\S/.test(selection));
	}
})();
