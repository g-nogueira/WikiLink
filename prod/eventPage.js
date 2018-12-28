(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function() {
	"use strict";

	chrome.runtime.onInstalled.addListener(initializeDB);

	/**
	 * 1: fallBackLanguage: 1: 'en' || 2: 'es' || 3: 'pt' || 4: 'ru'
	 * 2: popupMode: 1:'default' || 2: 'shortcut'
	 * 3: shortcutToShowPopover: 'keyId + keyId'
	 * 4: listOfLanguagesToProcess: [1?, 2?, 3?, 4?]
	 * 5: isPopoverEnabled : true || false
	 */
	async function initializeDB() {

		let wikilinkData = JSON.stringify({
			1: 'en',
			2: 'shortcut',
			3: ['ShiftLeft', 'AltLeft'],
			4: ['por', 'eng', 'esp', 'rus'],
			5: true
		});

		retrieve().then(response => {
			if (typeof response !== 'object') {
				chrome.storage.sync.set({ wldt: wikilinkData }, () => {});
			}
		}).catch(error => {
			chrome.storage.sync.set({ wldt: wikilinkData }, () => {});
			chrome.runtime.reload();
		});


	}

	function retrieve(property = '') {
		return new Promise(async (resolve, reject) => {
			var dataString = '';
			try {
				dataString = await new Promise(resolve => chrome.storage.sync.get('wldt', obj => resolve(obj['wldt'])));
				var data = JSON.parse(dataString);

				if (property.length > 0)
					resolve(data[this._encodeProp(property)])
				else resolve(data);

			} catch (error) {
				console.log("Is on catch block");
				reject(error);
			}

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

}());
},{}]},{},[1])

//# sourceMappingURL=eventPage.js.map
