(function () {
	'use strict';
	/**
	 * Shorthand function for querySelector
	 * @param {string} el 
	 * @returns {HTMLElement} 
	 */
	const DOM = elem => document.body.querySelector(elem);

	const userPreferences = new (require("../storageEntities/UserPreferences"));
	const applicationSettings = new (require("../storageEntities/ApplicationSettings"));

	initialization();

	////////////////// IMPLEMENTATION //////////////////
	async function initialization() {
		await applicationSettings.getAll();
		await userPreferences.getAll();

		applicationSettings.list.forEach((el) => {
			let id = `#${el.label.replace(".", "_")}`;
			DOM(id.toLowerCase()).value = el.value;
		});

		userPreferences.list.forEach((el) => {
			let id = `#${el.label.replace(".", "_")}`;
			DOM(id.toLowerCase()).value = el.value;
		});
	}

}());