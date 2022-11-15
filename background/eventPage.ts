import { StorageManager } from "../utils/StorageManager";

export function initializeStorage() {
	chrome.runtime.onInstalled.addListener(initializeDB);
}

/**
 * 1: fallBackLanguage: 1: 'en' || 2: 'es' || 3: 'pt' || 4: 'ru'
 * 2: popupMode: 1:'default' || 2: 'shortcut'
 * 3: shortcutToShowPopover: 'keyId + keyId'
 * 4: listOfLanguagesToProcess: [1?, 2?, 3?, 4?]
 * 5: isPopoverEnabled : true || false
 */
async function initializeDB() {
	let wikilinkData = JSON.stringify({
		1: "en",
		2: "shortcut",
		3: ["ShiftLeft", "AltLeft"],
		4: ["por", "eng", "esp", "rus"],
		5: true,
	});

	StorageManager.retrieve()
		.then((response) => {
			if (typeof response !== "object") {
				chrome.storage.sync.set({ wldt: wikilinkData }, () => {});
			}
		})
		.catch((error) => {
			chrome.storage.sync.set({ wldt: wikilinkData }, () => {});
			chrome.runtime.reload();
		});
}

// chrome.contextMenus.create({
//     title: 'Search \"%s\" on Wikipedia',
//     contexts: ["selection"],
//     onclick: function (info) {
//         const url = `http://www.wikipedia.org/w/index.php?title=Special:Search&search=${info.selectionText}`;
//         chrome.tabs.create({
//             url: url
//         });
//     }
// });
