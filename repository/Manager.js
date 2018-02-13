'using strict';

class Manager {
    constructor() {
        this._errorCode = {
            1: 'Object key not found on DB',
            2: 'Object key found, but the id was not'
        }
    }

    /**
     * 
     * @param {object} object pair object.
     * @param {String} object.key the key of the object.
     * @param {String} object.value the value of the object.
     * object = {key: value}
     * @returns {Promise}
     */
    async create(object) {

        return new Promise((resolve, reject) => {
            chrome.storage.sync.set(object, () => resolve());
        });
    }

    /**
     * @summary Inserts a new element in a list.
     * @param {*} key The key of the list of items.
     * @param {object} value The value to be pushed to the list.
     * @returns {Promise}
     */
    async push(key, value) {
        return new Promise((resolve, reject) => {

            chrome.storage.sync.get(key, list => {
                const arrayCopy = list[key].slice();
                const valueCopy = value;
                valueCopy.id = (new Date()).getTime();
                arrayCopy.push(valueCopy);

                chrome.storage.sync.set({ [key]: arrayCopy }, () => resolve(valueCopy));
            });
        });
    }

    /**
     * @summary Retrieves an object of provided key.
     * @param {string} key The type of the objects to retrieve.
     * @param {function} onSuccess The function to execute on success.
     * @returns {Promise}
     */
    async retrieve(key) {

        //⚠ It has to be of type "notes"
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(key, obj => (obj) ? resolve(obj[key]) : reject(this._errorCode[1]));
        });
    }

    /**
     * @summary Updates an object or an elemt of an object.
     * @param {object} obj The object to update.
     * @param {String} obj.key The key of the object to update.
     * @param {*} obj.value The new value of the object.
     * @param {String} [obj.id] The id of the object to update. If none provided, it will update the whole object.
     * @returns {Promise}
     */
    async update(obj) {
        return new Promise(async (resolve, reject) => {

            //If id is provided, update the specified element of the array.
            if (obj.id) {
                const list = await (new Promise((resolve, reject) => chrome.storage.sync.get(obj.key, obj => resolve(obj))));
                const arrayCopy = list[obj.key].slice();
                const index = arrayCopy.findIndex(el => el.id == obj.id);
                if (index === -1) {
                    reject(`Object of id ${obj.id} not found`);
                }
                else {
                    arrayCopy[index] = obj.value;
                    arrayCopy[index].id = obj.id;

                    chrome.storage.sync.set({ [obj.key]: arrayCopy }, () => {
                        resolve(arrayCopy[index]);
                    });
                }
            }
            else {
                chrome.storage.sync.set({ [obj.key]: obj.value });
            }
        });
    }

    /**
     * @summary Deletes an object or an element of an object.
     * @param {String} key The key of the object to remove.
     * @param {*} [id] The id of the element inside the object to be deleted. If none provided, it will delete the whole object.
     * @returns {Promise}
     */
    async delete(key, id) {

        return new Promise((resolve, reject) => {

            //If id is provided, delete of the array the element that has the id provided.
            if (id) {
                chrome.storage.sync.get(key, list => {
                    const arrayCopy = list[key].slice();
                    const index = arrayCopy.findIndex(el => el.id == id);
                    const deletedItem = arrayCopy.splice(index, 1);
                    const obj = {};

                    obj[key] = arrayCopy;

                    chrome.storage.sync.set(obj, () => resolve(deletedItem));
                });
            }
            else {
                chrome.storage.sync.remove(key, () => resolve());
            }
        });
    }
}

const manager = new Manager();