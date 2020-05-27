(() => {
	"use strict";

	module.exports = new (class SelectionHelper {

		constructor() {
			this.selection = {};
		}

		/**
		 * Get the current selection.
		 *
		 * @returns {Selection}
		 */
		getSelection() {
			return window.getSelection();
		}

		/**
		 * Gets the ClientRect of a selection.
		 *
		 * @param {Selection} selection
		 * @returns {DOMRect}
		 */
		getSelectionPosition(selection) {

			var range = selection.getRangeAt(0);
			var DOMRect = range.getBoundingClientRect();

			return DOMRect;
		}

		/**
		 * Gets a ClientRect from the bottom left corner of a selection.
		 *
		 * @param {Selection} selection
		 * @returns {DOMRect}
		 */
		getOffsetBottomPosition(selection) {
			var range = selection.getRangeAt(0);
			var clientRect = range.getBoundingClientRect();

			// Determine the position below the selection as pageYOffset + clientRect.y + clientRect.height
			// I.e.: the scroll height + selection position relative to the view
			var position = new DOMRect(clientRect.x, clientRect.y + clientRect.height + window.pageYOffset, clientRect.width, clientRect.height);

			return position;
		}


		/**
		 * Verifies if a Selection object is collapsed or white spaces
		 *
		 * @param {Selection} selection
		 * @returns
		 */
		isEmpty(selection) {
			//If given argument is not empty neither is white spaces
			return !(selection && /\S/.test(selection));
		}

		_createUniqueNode() {
			var node = document.createElement("span");

			node.id = (new Date()).getTime();
			node.style.position = "absolute";

			return node;
		}

	});

})();