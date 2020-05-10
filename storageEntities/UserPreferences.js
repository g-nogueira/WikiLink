
const Storage = require("../utils/Storage");
const uuid = require("uuid");

module.exports = class UserPreferences extends Storage {
    constructor() {

        super();

        this.storageName = "UserPreferences";
        this.id = 0;
        this.label = "";
        this.value = JSON.encode("");
        this.description = "";
        this.disabled = true;
        this.modifiedOn = null;
    }

    async createOrUpdate() {
        let response = null;
        let userPreferences = await this.retrieveStorage(this.storageName);
        let localUserPreference = {
            id: this.id,
            label: this.label,
            value: this.value,
            description: this.description,
            disabled: this.disabled,
            modifiedOn: this.modifiedOn
        };

        if (!Array.isArray(userPreferences)) {
            userPreferences = [];
        }

        let userPreferenceIndex = userPreferences.findIndex((userPreference) => userPreference.id === this.id);
        if (!localUserPreference.id || userPreferenceIndex === -1) {
            // Creates a user preference
            localUserPreference.id = uuid();
            userPreferences.push(localUserPreference);
            response = this.createStorage(this.storageName, userPreferences);

        } else {
            // Updates a user preference
            localUserPreference.modifiedOn = new Date();
            userPreferences[userPreferenceIndex] = localUserPreference;

            response = this.updateStorage(this.storageName, localUserPreference);
        }

        return response;
    }


};