
const Storage = require("../utils/Storage");
const uuid = require("uuid");

module.exports = class UserPreferences extends Storage {
    constructor() {

        super();

        this.storageName = "UserPreferences";
        this.label = "";
        this.value = "";
        this.description = "";
        this.disabled = false;
        this.modifiedOn = null;
    }

    async get(label) {
        let response = null;
        let userPreferences = await this.retrieveStorage(this.storageName);

        if (!Array.isArray(userPreferences) || !label) {
            return null;
        }

        let applicationSettingIndex = userPreferences.findIndex((applicationSetting) => applicationSetting.label === label);

        if (applicationSettingIndex === -1) {
            return null;
        }

        response = userPreferences[applicationSettingIndex];

        this.label = response.label;
        this.value = response.value;
        this.description = response.description;
        this.disabled = response.disabled;
        this.modifiedOn = response.modifiedOn;

        return response;
    }

    async create() {
        let response = null;
        let userPreferences = await this.retrieveStorage(this.storageName);
        let localUserPreference = {
            label: this.label,
            value: this.value,
            description: this.description,
            disabled: this.disabled,
            modifiedOn: null
        };

        if (!Array.isArray(userPreferences) || userPreferences.length === 0) {
            userPreferences = [];
        }

        // Creates a user preference
        userPreferences.push(localUserPreference);

        response = await this.updateStorage(this.storageName, userPreferences);

        return response;
    }

    async update() {
        let response = null;
        let applicationSettings = await this.retrieveStorage(this.storageName);
        let localUserPreference = {
            label: this.label,
            value: this.value,
            description: this.description,
            disabled: this.disabled,
            modifiedOn: this.modifiedOn
        };

        if (!Array.isArray(applicationSettings) || applicationSettings.length === 0) {
            applicationSettings = [];
        }

        let applicationSettingIndex = applicationSettings.findIndex((applicationSetting) => applicationSetting.label === this.label);

        if (applicationSettingIndex === -1) {
            throw new Error("Application Setting not found.");
        }

        // Updates a user preference
        localUserPreference.modifiedOn = new Date();
        applicationSettings[applicationSettingIndex] = localUserPreference;

        response = await this.updateStorage(this.storageName, applicationSettings);

        return response;
    }


};