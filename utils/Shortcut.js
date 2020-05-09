"use strict";
const Events = require("./Events");
module.exports = new (class ShortcutHelper extends Events {

	constructor() {
		super();

		this.shortcut = [];
		this.events = {
			/** The `shortcutMatch` event is fired when a matching shortcut is pressed. */
			shortcutMatch: "shortcutMatch"
		};

	}

	/**
	 *
	 *
	 * @param {Array<String>} shortcut An array of key names
	 */
	init(shortcut) {
		this.shortcut = shortcut;

		var timeOutId = null;
		var keyGroup = [];
		var that = this;

		document.addEventListener("keydown", function onKeyDown(ev) {

			clearTimeout(timeOutId);

			if (keyGroup.toString() === shortcut.toString()) {

				that.dispatchEvent(that.events.shortcutMatch, { shortcut: shortcut });
				keyGroup = [];

			} else if (keyGroup.length < shortcut.length && !keyGroup.includes(ev.code)) {
				keyGroup.push(ev.code);
				onKeyDown(ev);
			}

			timeOutId = setTimeout(() => keyGroup = [], 10 * 1000);
		});

		document.addEventListener("keyup", function onKeyUp(ev) {
			var index = keyGroup.indexOf(ev.code);
			if (index !== -1) {
				keyGroup.splice(index, 1);
			}
		});
	}

});