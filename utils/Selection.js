(() => {
	"use strict";

	module.exports = new (class Selection {

		constructor() {
			this.selection = {};
		}

		getSelection() {
			return window.getSelection();
		}

		/**
		 *
		 *
		 * @param {Selection} selection
		 * @returns
		 */
		getSelectionPosition(selection) {

			var temporaryNode = this.createUniqueNode();
			var range = selection.getRangeAt(0);
			var clientRect = range.getBoundingClientRect();
			var position = { top: 0, left: 0 };

			// Determine the position of the selection as selectionHeight
			position.top = clientRect.height;
			position.left = clientRect.left;

			// Remove the previously inserted node
			temporaryNode.parentElement.removeChild(temporaryNode);

			return position;
		}

		getOffsetBottomCoordinates(selection) {
			var temporaryNode = this.createUniqueNode();
			var temporaryNodeTop = 0;
			var range = selection.getRangeAt(0);
			var clientRect = range.getBoundingClientRect();
			var position = { top: 0, left: 0 };

			// Insert a node at the start of the selection and get its position relative to the top of the body
			range.insertNode(temporaryNode);
			temporaryNodeTop = temporaryNode.offsetTop;

			// Determine the position below the selection as scrolledHeight (i.e.: temporaryNodeTop) + selectionHeight
			position.top = temporaryNodeTop + clientRect.height;
			position.left = clientRect.left;

			// Remove the previously inserted node
			temporaryNode.parentElement.removeChild(temporaryNode);

			return position;
		}


		createUniqueNode() {
			var node = document.createElement("span");

			node.id = (new Date()).getTime();
			node.style.position = "absolute";

			return node;
		}

	});

})();