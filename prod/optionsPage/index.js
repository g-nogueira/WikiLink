(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function() {
	'use strict';
	/**
	 * Shorthand function for querySelector
	 * @param {string} el 
	 * @returns {HTMLElement} 
	 */
	const DOM = elem => document.body.querySelector(elem);
	const popoverDB = require("../utils/StorageManager");
	const MDCSnackbar = mdc.snackbar.MDCSnackbar;
	const MDCSnackbarFoundation = mdc.snackbar.MDCSnackbarFoundation;
	mdc.snackbar.MDCSnackbar.attachTo(DOM('.mdc-snackbar'));
	const snackbar = new MDCSnackbar(DOM('.mdc-snackbar'))
	var shortcutSnapshot = '';
	var keyGroup = {
		codes: [],
		pressing: []
	};

	initializer().DOMEvents()
	initializer().elementsValues()
	initializer().storageEvents()



	////////////////// IMPLEMENTATION //////////////////

	function initializer() {

		/**
		 * Initializes DOM events listeners
		 */
		function DOMEvents() {
			DOM('.js-popupShortcut').addEventListener('keydown', onKeyDown);
			DOM('.js-popupShortcut').addEventListener('keyup', onKeyUp);
			DOM('.js-popupShortcut').addEventListener('focus', onFocus);
			DOM('.js-popupShortcut').addEventListener('focusout', onFocusOut);
			DOM('.js-popupMode').addEventListener('change', savePopupMode);
			DOM('.js-fallbackLanguage').addEventListener('change', saveLanguage);
			DOM('.js-nlpLanguages').addEventListener('change', saveNlpLanguages);
		}

		/**
		 * Initializes DOM Elements values
		 */
		function elementsValues() {
			syncValues();
		}

		/**
		 * Initializes storage changes listeners.
		 */
		function storageEvents() {
			popoverDB.onChanges(syncValues);
		}

		return {
			DOMEvents,
			elementsValues,
			storageEvents
		};

	}

	function onFocus(ev) {
		var val = DOM('.js-popupShortcut').value;
		if (val) {
			shortcutSnapshot = val;
		}
		DOM('.js-popupShortcut').value = '';
	}

	function onFocusOut(ev) {
		if (DOM('.js-popupShortcut').value) {
			saveShortcut();
			snackbar.show({ message: 'Shortcut saved!' });
		} else {
			DOM('.js-popupShortcut').value = shortcutSnapshot;
		}

	}

	function onKeyDown(ev) {
		console.log(keyGroup.pressing);
		if (keyGroup.pressing.length === 0) {
			keyGroup.codes = [];
		}
		if (keyGroup.codes.length < 3 && !keyGroup.codes.includes(ev.code)) {
			keyGroup.pressing.push(ev.keyCode);
			keyGroup.codes.push(ev.code);
			DOM('.js-popupShortcut').value = keyGroup.codes.toString();
		}

	}

	function onKeyUp(ev) {
		console.log(keyGroup.pressing);
		var index = keyGroup.codes.indexOf(ev.code);
		if (index !== -1) {
			keyGroup.pressing.splice(index, 1);
		}

	}

	async function syncValues(oldV, newV) {
		var fallbackLang = newV && newV['fallbackLang'] || await popoverDB.retrieve('fallbackLang');
		var popupMode = newV && newV['popupMode'] || await popoverDB.retrieve('popupMode');
		var nlpLangs = newV && newV['nlpLangs'] || await popoverDB.retrieve('nlpLangs');
		var shortcut = newV && newV['shortcut'] || await popoverDB.retrieve('shortcut');

		DOM('.js-fallbackLanguage').value = fallbackLang;
		DOM('.js-popupMode').value = popupMode;
		DOM('.js-popupShortcut').value = shortcut.toString();

		var checkboxList = document.body.querySelectorAll('.js-nlpLang');
		checkboxList.forEach(chkbx => {
			if (nlpLangs.includes(chkbx.value)) {
				chkbx.checked = true;
			}
		});
	}

	function saveLanguage() {
		var fallbackLanguage = DOM('.js-fallbackLanguage').value;
		popoverDB.update('fallbackLang', fallbackLanguage).then(resp => {
			snackbar.show({ message: ' ✔ Language definitions saved' });
		})
	}

	function savePopupMode() {
		var popupMode = DOM('.js-popupMode').value;
		popoverDB.update('popupMode', popupMode).then(resp => {
			snackbar.show({ message: '✔ Popup trigger definitions saved' });
		});
	}

	function saveShortcut() {
		var shortcut = keyGroup.codes;
		popoverDB.update('shortcut', shortcut)
			.then(resp => {
				snackbar.show({ message: '✔ Shortcut definitions saved' });
			});
	}

	function saveNlpLanguages() {
		var languages = [];
		var checkboxList = document.body.querySelectorAll('.js-nlpLang');

		checkboxList.forEach(chkbx => {
			if (chkbx.checked) {
				languages.push(chkbx.value);
			}
		});
		popoverDB.update('nlpLangs', languages).then(resp => {
			snackbar.show({ message: '✔ Search Languages definitions saved' });
		});
	}
}());
},{"../utils/StorageManager":2}],2:[function(require,module,exports){
(() => {
	'use strict';


	/**
	 * Manages and facilitate storage (chrome.storage.sync) requests and watchers.
	 */
	class PopoverDB {

		constructor() {
			this._errorCode = {
				1: key => `Object "${key}" not found`,
				2: (key, property) => `Object property "${key}.${property}" not found in storage.`,
				3: property => `Object property ".${property}" not found in storage.`
			};

			this._encodeProp = propertyName => {

				let props = {
					isEnabled: 5,
					fallbackLang: 1,
					nlpLangs: 4,
					shortcut: 3,
					popupMode: 2
				}

				return props[propertyName];
			}

			this._decodeProp = propertyName => {

				let props = {
					5: 'isEnabled',
					1: 'fallbackLang',
					4: 'nlpLangs',
					3: 'shortcut',
					2: 'popupMode'
				}

				return props[propertyName];
			}

			this._decodeObj = obj => {
				let decodedObj = {};
				Object.keys(obj).forEach(key => {
					decodedObj[this._decodeProp(key)] = obj[key];
				});

				return decodedObj;
			}

		}

		update(property, value) {
			return new Promise(async (resolve, reject) => {
				var dataString = '';
				var data = await this.retrieve();

				data[this._encodeProp(property)] = value;
				dataString = JSON.stringify(data);

				chrome.storage.sync.set({
					wldt: dataString
				}, () => resolve(true));
			});
		}

		retrieve(property = '') {
			var errorCount = 0;
			return new Promise(async (resolve, reject) => {
				var dataString = '';
				try {
					dataString = await new Promise(resolve => chrome.storage.sync.get('wldt', obj => resolve(obj['wldt'])));
					var data = JSON.parse(dataString);

					if (property.length > 0)
						resolve(data[this._encodeProp(property)])
					else resolve(data);

				} catch (error) {
					errorCount += 1;
					if (errorCount >= 2) {
						reject(error);
					} else {
						let wikilinkData = JSON.stringify({
							1: 'en',
							2: 'shortcut',
							3: ['ShiftLeft', 'AltLeft'],
							4: ['por', 'eng', 'esp', 'rus'],
							5: true
						});
						chrome.storage.sync.set({ wldt: wikilinkData }, () => this.retrieve(property));
					}
				}

			});
		}


		/**
		 * Listens to storage changes in given object and executes a function in a onChanged event.
		 * @param {*} objName The name of the object in the storage to listens.
		 * @returns {object} A function to pass as an argument the function to execute on event.
		 */
		onChanges(fn) {

			var decodedObj = this._decodeObj;

			chrome.storage.onChanged.addListener((changes, areaName) => {
				//Popover enabled state changed
				if (changes['wldt']) {
					fn(decodedObj(JSON.parse(changes['wldt'].oldValue)), decodedObj(JSON.parse(changes['wldt'].newValue)));
				};
			});
		}
	}

	module.exports = new PopoverDB();

})();
},{}]},{},[1])

//# sourceMappingURL=index.js.map
