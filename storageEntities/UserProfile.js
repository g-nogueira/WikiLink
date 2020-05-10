
const Storage = require("../utils/Storage");

module.exports = class UserProfile extends Storage {
    constructor() {

        super();

        this.storageName = "UserProfile";
        this.firstName = "";
        this.lastName = "";
        this.birthDate = new Date();
        this.modifiedOn = null;
    }

    async createOrUpdate() {
        let response = null;
        let userProfile = await this.retrieveStorage(this.storageName);
        let localUserProfile = {
            firstName: this.firstName,
            lastName: this.lastName,
            birthDate: this.birthDate,
            modifiedOn: this.modifiedOn
        };

        if (userProfile === null) {
            response = this.createStorage(this.storageName, localUserProfile);
        } else {
            localUserProfile.modifiedOn = new Date();
            response = this.updateStorage(this.storageName, localUserProfile)
        }

        return response;
    }


}