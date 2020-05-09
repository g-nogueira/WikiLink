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
			var temporaryNode = this._createUniqueNode();
			var temporaryNodeTop = 0;
			var range = selection.getRangeAt(0);
			var clientRect = range.getBoundingClientRect();

			// Insert a node at the start of the selection and get its position relative to the top of the body
			range.insertNode(temporaryNode);
			temporaryNodeTop = temporaryNode.offsetTop;

			// Determine the position below the selection as scrolledHeight (i.e.: temporaryNodeTop) + selectionHeight
			var position = new DOMRect(clientRect.x, clientRect.height + temporaryNodeTop, clientRect.width, clientRect.height);

			// Remove the previously inserted node
			temporaryNode.parentElement.removeChild(temporaryNode);

			return position;
		}


		_createUniqueNode() {
			var node = document.createElement("span");

			node.id = (new Date()).getTime();
			node.style.position = "absolute";

			return node;
		}

	});

})();