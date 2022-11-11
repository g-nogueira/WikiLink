const Events = require("../utils/Events");

/**
 * Manages and facilitates storage (chrome.storage.sync) requests and watchers.
 */
module.exports = class StorageHelper extends Events {

	constructor() {
		super();

		this.storageName = "";
		this.list = [];
		this.events = {
			storageChange: "storageChange"
		};

		chrome.storage.onChanged.addListener((changes, areaName) => {

			if (this.storageName.length > 0 && changes[this.storageName]) {
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

	async getAll() {
		let response = null;
		let storage = await this.retrieveStorage(this.storageName);

		if (!Array.isArray(storage)) {
			this.list = [];
			return null;
		}

		response = storage;
		this.list = response;

		return response;
	}
};