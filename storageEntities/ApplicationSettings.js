
const Storage = require("../utils/Storage");

module.exports = class ApplicationSettings extends Storage {
    constructor() {

        super();

        this.storageName = "ApplicationSettings";
        this.label = "";
        this.value = "";
        this.description = "";
        this.modifiedOn = null;
    }

    async get(label) {
        let response = null;
        let applicationSettings = await this.retrieveStorage(this.storageName);

        if (!Array.isArray(applicationSettings) || !label) {
            return null;
        }

        let applicationSettingIndex = applicationSettings.findIndex((applicationSetting) => applicationSetting.label === label);

        if (applicationSettingIndex === -1) {
            return null;
        }

        response = applicationSettings[applicationSettingIndex];

        this.label = response.label;
        this.value = response.value;
        this.description = response.description;
        this.modifiedOn = response.modifiedOn;

        return response;
    }

    async update() {
        let response = null;
        let applicationSettings = await this.retrieveStorage(this.storageName);
        let localApplicationSetting = {
            label: this.label,
            value: this.value,
            description: this.description,
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
        localApplicationSetting.modifiedOn = new Date();
        applicationSettings[applicationSettingIndex] = localApplicationSetting;

        response = await this.updateStorage(this.storageName, applicationSettings);

        return response;
    }

    async create() {
        let response = null;
        let applicationSettings = await this.retrieveStorage(this.storageName);
        let localApplicationSetting = {
            label: this.label,
            value: this.value,
            description: this.description,
            modifiedOn: null
        };

        if (!Array.isArray(applicationSettings) || applicationSettings.length === 0) {
            applicationSettings = [];
        }

        // Creates a user preference
        applicationSettings.push(localApplicationSetting);

        response = await this.updateStorage(this.storageName, applicationSettings);

        return response;
    }


};