"use strict";


const Events = require("../utils/Events");

/**
 * Manages and facilitates storage (chrome.storage.sync) requests and watchers.
 */
module.exports = class StorageHelper extends Events {

	constructor() {
		super();

		this.storageName = "";
		this.events = {
			storageChange: "storageChange"
		};

		chrome.storage.onChanged.addListener((changes, areaName) => {

			if (this.storageName.length > 0) {
				this.dispatchEvent(this.events.storageChange, {
					oldValue: changes[this.storageName].oldValue,
					newValue: changes[this.storageName].newValue
				});
			} else {
				this.dispatchEvent(this.events.storageChange, {
					oldValue: changes.oldValue,
					newValue: changes.newValue
				});
			}

		});

		this._errorCode = {
			1: (key) => `Object "${key}" not found`,
			2: (key, property) => `Object property "${key}.${property}" not found in storage.`,
			3: (property) => `Object property ".${property}" not found in storage.`
		};

		this._encodeProp = (propertyName) => {

			let props = {
				isEnabled: 5,
				fallbackLang: 1,
				nlpLangs: 4,
				shortcut: 3,
				popupMode: 2
			}

			return props[propertyName];
		};

		this._decodeProp = (propertyName) => {

			let props = {
				5: "isEnabled",
				1: "fallbackLang",
				4: "nlpLangs",
				3: "shortcut",
				2: "popupMode"
			}

			return props[propertyName];
		};

		this._decodeObj = (obj) => {
			let decodedObj = {};
			Object.keys(obj).forEach(key => {
				decodedObj[this._decodeProp(key)] = obj[key];
			});

			return decodedObj;
		};

	}

	retrieveStorage(name) {
		return new Promise((resolve, reject) => {

			chrome.storage.sync.get(name, (obj) => {

				if (obj[name]) {
					resolve(obj[name]);
				}
				else {
					resolve(null);
				}

			});
		});
	}


	updateStorage(name, value) {
		return new Promise((resolve, reject) => {
			chrome.storage.sync.set({ [name]: value }, () => resolve(true));
		});
	}

	createStorage(name, value) {
		return new Promise((resolve, reject) => {
			chrome.storage.sync.set({ [name]: value }, () => resolve(true));
		});
	}


	update(property, value) {
		return new Promise(async (resolve, reject) => {
			var dataString = "";
			var data = await this.retrieve();

			data[this._encodeProp(property)] = value;
			dataString = JSON.stringify(data);

			chrome.storage.sync.set({
				wldt: dataString
			}, () => resolve(true));
		});
	}

	retrieve(property = "") {
		var errorCount = 0;
		return new Promise(async (resolve, reject) => {
			var dataString = "";
			try {
				dataString = await new Promise(resolve => chrome.storage.sync.get("wldt", obj => resolve(obj["wldt"])));
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
						1: "en",
						2: "shortcut",
						3: ["ShiftLeft", "AltLeft"],
						4: ["por", "eng", "esp", "rus"],
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
			if (changes["wldt"]) {
				fn(decodedObj(JSON.parse(changes["wldt"].oldValue)), decodedObj(JSON.parse(changes["wldt"].newValue)));
			}
		});

	}
};