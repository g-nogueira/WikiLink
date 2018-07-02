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
        return new Promise(async (resolve, reject) => {
            var dataString = '';
            try {
                dataString = await new Promise(resolve => chrome.storage.sync.get('wldt', obj => resolve(obj['wldt'])));
                var data = JSON.parse(dataString);

                if (property.length > 0)
                    resolve(data[this._encodeProp(property)])
                else resolve(data);

            } catch (error) {
                reject(error);
            }

        });
    }


    /**
     * Listens to storage changes in given object and executes a function in a onChanged event.
     * @param {*} objName The name of the object in the storage to listens.
     * @returns {object} A function to pass as an argument the function to execute on event.
     */
    watchChanges() {

        var decodedObj = this._decodeObj;

        function execute(fn) {
            chrome.storage.onChanged.addListener((changes, areaName) => {
                //Popover enabled state changed
                if (changes['wldt']) {
                    fn(decodedObj(JSON.parse(changes['wldt'].oldValue)), decodedObj(JSON.parse(changes['wldt'].newValue)));
                };
            });
        }

        return {
            then: execute
        };
    }
}

const popoverDB = new PopoverDB();