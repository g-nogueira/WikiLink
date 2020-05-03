"use strict";

module.exports = new (class Selection {

	constructor() {
		this.shortcut = [];
		this.dispatcher = document;

		this.addEventListener = this.dispatcher.addEventListener;
		this.events = {
			shortcutMatchEvent: this.shortcutMatchEvent
		};
	}

	startShortcutListener(shortcut) {
		this.dispatcher = document.createElement("div");
		this.shortcut = shortcut;

		var timeOutId = null;
		var keyGroup = [];
		var that = this;

		document.addEventListener("keydown", function onKeyDown(ev) {

			clearTimeout(timeOutId);

			if (keyGroup.toString() === shortcut.toString()) {

				that.dispatcher.dispatchEvent(that.events.shortcutMatchEvent);
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

	get shortcutMatchEvent() {
		return new CustomEvent("shortcutMatch", {
			bubbles: true,
			detail: {}
		});
	}

});