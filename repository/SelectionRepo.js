(() => {
    module.exports = (function selectionRepo() {
        return {
            getSelectionString: getSelectionString,
            getSelection: getSelection,
            isSelectionEmpty: isSelectionEmpty,
            getSelectionContext: getSelectionContext
        }

        function getSelectionString() {
            var wSelection = window.getSelection();
            return wSelection.toString();
        }

        function getSelectionContext() {
            return wSelection.focusNode.data;
        }

        function getSelection() {
            return window.getSelection();
        }

        function isSelectionEmpty() {
            //If given argument is not empty neither is white spaces
            return !(selection && /\S/.test(selection));
        }
    })();
})();