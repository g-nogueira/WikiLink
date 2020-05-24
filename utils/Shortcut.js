"use strict";
const Events = require("./Events");
module.exports = new (class ShortcutHelper extends Events {

	constructor() {
		super();

		/** @type  {Array<String[]>}*/
		this.shortcut = [];
		this.events = {
			/** The `shortcutMatch` event is fired when a matching shortcut is pressed. */
			shortcutMatch: "shortcutMatch",
			/** The `keyGroupDown` event is fired when a group of keys are pressed. */
			keyGroupDown: "keyGroupDown"
		};

		this.init();

	}

	/**
	 *
	 *
	 * @param {Array<String>} shortcut An array of key names
	 */
	init() {
		this._bootstrapShortcutMatchEvent();
		this._bootstrapKeyDownEvent();
	}


	_bootstrapShortcutMatchEvent() {
		var timeOutId = null;
		var keyPressingGroung = [];
		var that = this;


		document.addEventListener("keydown", function onKeyDown(ev) {

			if (that.shortcut.length === 0) {
				return;
			}

			let shortcut = that.shortcut.filter((sc) => keyPressingGroung.toString() === sc.toString())[0];
			let keyDown = ev.code;

			clearTimeout(timeOutId);

			if (shortcut.length > 0) {

				// Dispatch shortcutMatch event
				that.dispatchEvent(that.events.shortcutMatch, { shortcut: shortcut }, ev);
				keyPressingGroung = [];

			} else if (!keyPressingGroung.includes(keyDown)) {

				// Add another key keyPressingGroung
				keyPressingGroung.push(keyDown);
				onKeyDown(ev);
			}

			// Clears in 10 seconds the current pressed shortcut
			timeOutId = setTimeout(() => keyPressingGroung = [], 10 * 1000);
		});

		document.addEventListener("keyup", function onKeyUp(ev) {
			let keyDown = ev.code;
			let index = keyPressingGroung.indexOf(keyDown);
			if (index !== -1) {
				keyPressingGroung.splice(index, 1);
			}
		});
	}

	_bootstrapKeyDownEvent() {
		var timeOutId = null;
		var keyPressingGroung = [];
		var that = this;


		document.addEventListener("keydown", function onKeyDown(ev) {

			// Resets the clear timer
			clearTimeout(timeOutId);
			let keyDown = ev.code;


			// Add another key keyPressingGroung
			if (!keyPressingGroung.includes(keyDown)) {

				keyPressingGroung.push(keyDown);
				that.dispatchEvent(that.events.keyGroupDown, { keyGroup: keyPressingGroung }, ev);
				onKeyDown(ev);
			}

			// Clears the current pressed group in 10 seconds
			timeOutId = setTimeout(() => keyPressingGroung = [], 10 * 1000);
		});

		document.addEventListener("keyup", function onKeyUp(ev) {
			let keyDown = ev.code;
			let index = keyPressingGroung.indexOf(keyDown);
			if (index !== -1) {
				keyPressingGroung.splice(index, 1);
				that.dispatchEvent(that.events.keyGroupDown, { keyGroup: keyPressingGroung }, ev);
			}
		});
	}

});