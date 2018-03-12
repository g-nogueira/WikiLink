'use strict';

/**
 * Manages and facilitate storage (chrome.storage.sync) requests and watchers.
 */
class Manager {
    constructor() {
        this._errorCode = {
            1: key => `Object "${key}" not found`,
            2: (key, property) => `Object property "${key}.${property}" not found in storage.`,
            3: property => `Object property ".${property}" not found in storage.`
        }

    }

    /**
     * Stores an key-value pair object ({[objName]: [value]}) in the storage
     * @param {object} obj The key-value pair object to be stored.
     * @returns {Promise}
     */
    create(obj) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set(obj, () => resolve());
        });
    }

    /**
     * Inserts a new element in a list and gives an unique id to it.
     * @param {string} objName The name of the list of items.
     * @param {any} value The value to be pushed to the list.
     * @returns {Promise}
     */
    push(objName, value) {
        return new Promise(async (resolve, reject) => {
            var list = await new Promise(resolve => chrome.storage.sync.get(objName, list => resolve(list[objName])));
            var valueCopy = value;

            valueCopy.id = idGenerator().generate();
            list.push(valueCopy);

            chrome.storage.sync.set({ [objName]: arrayCopy }, () => resolve(valueCopy));
        });
    }

    /**
     * Retrieves an object or object property by given key and property name.
     * @param {string} key The type of the objects to retrieve.
     * @param {string} [property = ''] The specific property to return.
     * @param {function} onSuccess The function to execute on success.
     * @returns {Promise}
     */
    retrieve(key, property = '') {
        return new Promise(async (resolve, reject) => {
            try {
                var resp = await new Promise(resolve => chrome.storage.sync.get(key, obj => resolve(obj[key])));

                if (property !== '') {
                    let verifiedProp = this.objectVerifier(resp).propExists(property);
                    verifiedProp.exists ? resolve(verifiedProp.value) : reject(verifiedProp.error);
                }
                else resolve(resp);

            } catch (error) {
                reject(this._errorCode[1](key));
            }
        });
    }

    /**
     * Updates an object or an element of an object.
     * @param {String} obj.objName The name of the object to update.
     * @returns { property, update }
     */
    update(objName) {
        /**
         * Updates just given object property.
         * @param {*} property The property of the object to update.
         * @param {*} value The new value of the property.
         * @returns {Promise<object>}
         */
        function updateProperty(property, value) {
            return new Promise(async (resolve, reject) => {
                const obj = await (new Promise((resolve, reject) => chrome.storage.sync.get(objName, obj => resolve(obj[objName]))));

                obj[property] = value;
                chrome.storage.sync.set({ [objName]: obj });
                resolve(obj);
            });
        }

        /**
         * Updates the whole object with given value.
         * @param {*} value The new value of the object.
         * @returns {Promise<object>}
         */
        function update(value) {
            return new Promise(resolve => {
                chrome.storage.sync.set({ [objName]: value });

                resolve({ [objName]: value });
            });
        }

        return { property: updateProperty, value: update }

    }

    /**
     * Deletes an object or a object's property.
     * @param {String} key The key of the object to remove.
     * @param {*} [id] The id of the element inside the object to be deleted. If none provided, it will delete the whole object.
     * @returns {Promise<object>}
     */
    delete(key) {
        return new Promise(async (resolve, reject) => {
            var resp = await new Promise(resolve => chrome.storage.sync.get(key, obj => obj[key]));
            var obj = resp ? resp : undefined;

            if (obj !== undefined) {
                chrome.storage.sync.remove(key, () => resolve(obj));
            }
            else reject(this._errorCode[2](key));
        });
    }

    idGenerator() {

        function generateUnique() {
            return (new Date()).getTime();
        }

        return { generate: generateUnique };
    }

    objectVerifier(obj) {
        var context = this;

        function verifyProperty(propName) {
            if (obj) {
                if (obj[propName] !== undefined) {
                    return { exists: true, error: null, value: obj[propName] };
                }
                else return { exists: false, error: context._errorCode[3](propName) };
            }
            else return { exists: false, error: (context._errorCode[1]('')) };
        }

        function verifyObject() {
            if (obj) {
                return { isReal: true, error: null, value: obj };
            }
            else return { isReal: false, error: (context._errorCode[2]('')) }
        }

        return { propExists: verifyProperty, isObject: verifyObject }
    }

    /**
     * Listens to storage changes in given object and executes a function in a onChanged event.
     * @param {*} objName The name of the object in the storage to listens.
     * @returns {object} A function to pass as an argument the function to execute on event.
     */
    changesListener(objName){

        function execute(fn){
            var name = objName
            chrome.storage.onChanged.addListener((changes, areaName) => {
                //Popover enabled state changed
                if (changes[objName]) {
                    fn(changes[objName].oldValue, changes[objName].newValue);
                };
            });
        }

        return {execute};
    }
}

const manager = new Manager();