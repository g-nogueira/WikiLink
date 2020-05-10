
const Storage = require("../utils/Storage");

module.exports = class ApplicationSettings extends Storage {
    constructor() {

        super();

        this.storageName = "ApplicationSettings";
        this.label = "";
        this.value = JSON.encode("");
        this.description = "";
        this.modifiedOn = null;
    }

    async get(id) {
        let response = null;
        let applicationSettings = await this.retrieveStorage(this.storageName);

        if (!Array.isArray(applicationSettings) || !id) {
            return null;
        }

        let applicationSettingIndex = applicationSettings.findIndex((applicationSetting) => applicationSetting.id === id);

        if (applicationSettingIndex === -1) {
            return null;
        }

        response = applicationSettings[applicationSettingIndex];

        this.id = response.id;
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
            id: this.id,
            label: this.label,
            value: this.value,
            description: this.description,
            modifiedOn: this.modifiedOn
        };

        if (!Array.isArray(applicationSettings)) {
            applicationSettings = [];
        }

        let applicationSettingIndex = applicationSettings.findIndex((applicationSetting) => applicationSetting.id === this.id);

        if (applicationSettingIndex === -1) {
            throw new Error("Application Setting not found.");
        }

        // Updates a user preference
        localApplicationSetting.modifiedOn = new Date();
        applicationSettings[applicationSettingIndex] = localApplicationSetting;

        response = this.updateStorage(this.storageName, localApplicationSetting);

        return response;
    }


};