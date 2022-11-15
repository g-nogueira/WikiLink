/**
 * Manages and facilitate storage (chrome.storage.sync) requests and watchers.
 */
class PopoverDB {
	#errorCode = {
		1: (key: string) => `Object "${key}" not found`,
		2: (key: string, property: string) => `Object property "${key}.${property}" not found in storage.`,
		3: (property: string) => `Object property ".${property}" not found in storage.`,
	};

	constructor() {}

	update(property: string, value: any) {
		return new Promise(async (resolve, reject) => {
			var dataString = "";
			var data = await this.retrieve();

			data[this._encodeProp(property)] = value;
			dataString = JSON.stringify(data);

			chrome.storage.sync.set({ wldt: dataString }, () => resolve(true));
		});
	}

	retrieve(property = ""): Promise<any> {
		var errorCount = 0;
		return new Promise(async (resolve, reject) => {
			var dataString = "";
			try {
				dataString = await new Promise((resolve) => chrome.storage.sync.get("wldt", (obj) => resolve(obj["wldt"])));
				var data = JSON.parse(dataString);

				if (property.length > 0) resolve(data[this._encodeProp(property)]);
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
						5: true,
					});
					chrome.storage.sync.set({ wldt: wikilinkData }, () => this.retrieve(property));
				}
			}
		});
	}

	/**
	 * Listens to storage changes in given object and executes a function in a onChanged event.
	 * @param {*} objName The name of the object in the storage to listens.
	 * @returns {Function} A function to pass as an argument the function to execute on event.
	 */
	onChanges(fn: Function): void {
		var decodedObj = this._decodeObj;

		chrome.storage.onChanged.addListener((changes, areaName) => {
			//Popover enabled state changed
			if (changes["wldt"]) {
				fn(decodedObj(JSON.parse(changes["wldt"].oldValue)), decodedObj(JSON.parse(changes["wldt"].newValue)));
			}
		});
	}

	private _decodeProp(propertyName: number) {
		let props: { [key: number]: string } = {
			5: "isEnabled",
			1: "fallbackLang",
			4: "nlpLangs",
			3: "shortcut",
			2: "popupMode",
		};

		return props[propertyName];
	}

	private _encodeProp(propertyName: string) {
		let props: { [key: string]: number } = {
			isEnabled: 5,
			fallbackLang: 1,
			nlpLangs: 4,
			shortcut: 3,
			popupMode: 2,
		};

		return props[propertyName];
	}

	private _decodeObj(obj: any) {
		let decodedObj: any = {};

		Object.keys(obj).forEach((key) => {
			decodedObj[this._decodeProp(+key)] = obj[key];
		});

		return decodedObj;
	}
}
export let StorageManager = new PopoverDB();