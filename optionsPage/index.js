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
	const shortcutHelper = require("../utils/Shortcut");

	initialization();
	watchShortcutInput();
	watchFormChange();

	////////////////// IMPLEMENTATION //////////////////

	/**
	 * Initializes the necessary first load data.
	 */
	async function initialization() {
		await applicationSettings.getAll();
		await userPreferences.getAll();

		applicationSettings.list.forEach((el) => {
			let id = `#${el.label.replace(".", "_")}`;
			DOM(id).value = el.value;
		});

		userPreferences.list.forEach((el) => {
			let id = `#${el.label.replace(".", "_")}`;
			DOM(id).value = el.value;
		});
	}

	/**
	 * Handles the shortcut input field functionalities.
	 */
	function watchShortcutInput() {

		var input = DOM("#shortcuts_toggleModal");

		// 1. On focusin empties the input 
		input.addEventListener("focusin", (ev) => {
			input.dataset.keyGroupDown = input.value;
			input.value = "";
		});

		// 2. On keydown sets the keys pressed
		shortcutHelper.addEventListener(shortcutHelper.events.keyGroupDown, (ev) => {
			if (ev.detail.ev.target !== input) {
				return;
			}

			if (ev.detail.keyGroup.length < input.value.split(",").length) {
				return;
			}

			input.value = ev.detail.keyGroup;
		});

		// 3. On focusout rollback to original value, if empty
		input.addEventListener("focusout", (ev) => {
			if (input.value !== "") {
				return;
			}

			input.value = input.dataset.keyGroupDown;
		});
	}

	/**
	 * Saves updates to forms.
	 */
	function watchFormChange() {
		var formApplicationSettings = DOM("#form_applicationSettings");
		var formUserPreferences = DOM("#form_userPreferences");

		formApplicationSettings.addEventListener("change", async (ev) => {
			for (const el of formApplicationSettings.elements) {

				let label = el.id.replace("_", ".");
				await applicationSettings.get(label);

				applicationSettings.value = el.value;
				applicationSettings.modifiedOn = new Date();
				await applicationSettings.update();
			}
		});

		formUserPreferences.addEventListener("change", async (ev) => {
			for (const el of formUserPreferences.elements) {

				let label = el.id.replace("_", ".");
				await userPreferences.get(label);

				userPreferences.value = el.value;
				userPreferences.modifiedOn = new Date();
				await userPreferences.update();
			}
		});
	}

}());