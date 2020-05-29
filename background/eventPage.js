(function () {
	"use strict";

	chrome.runtime.onInstalled.addListener(() => {
		bootstrapApplicationSettings();
		bootstrapUserPreferences();
	});

	const storage = new (require("../utils/Storage"));
	const applicationSettings = new (require("../storageEntities/ApplicationSettings"));
	const userPreferences = new (require("../storageEntities/UserPreferences"));


	async function bootstrapApplicationSettings() {
		await applicationSettings.getAll();

		if (applicationSettings.list.length > 0) {
			return;
		}

		var settings = [
			{
				label: "modal.style",
				value: `width: 501px;
					height:276px;
					border: none;
					box-shadow: 0 30px 90px -20px rgba(0, 0, 0, 0.3), 0 0 1px #a2a9b1;`,
				description: ""
			},
			{
				label: "modal.shadowMode",
				value: "open",
				description: ""
			}
		];

		for (const setting of settings) {

			applicationSettings.label = setting.label;
			applicationSettings.value = setting.value;
			applicationSettings.description = setting.description;

			await applicationSettings.create();

		}
	}

	async function bootstrapUserPreferences() {
		await userPreferences.getAll();

		if (userPreferences.list.length > 0) {
			return;
		}

		var preferences = [
			{
				label: "modal.isEnabled",
				value: true,
				description: ""
			},
			{
				label: "shortcuts.toggleModal",
				value: ["ShiftLeft", "AltLeft"],
				description: ""
			}
		];

		for (const preference of preferences) {

			userPreferences.label = preference.label;
			userPreferences.value = preference.value;
			userPreferences.description = preference.description;

			await userPreferences.create();

		}
	}


	// chrome.contextMenus.create({
	//     title: 'Search \"%s\" on Wikipedia',
	//     contexts: ["selection"],
	//     onclick: function (info) {
	//         const url = `http://www.wikipedia.org/w/index.php?title=Special:Search&search=${info.selectionText}`;
	//         chrome.tabs.create({
	//             url: url
	//         });
	//     }
	// });

}());