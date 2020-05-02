(() => {
    'use strict';

    module.exports = { getBasicShell };


	/**
	 * Generates the popover main structure without any data.
	 * @returns {DocumentFragment} A popover documentFragment.
	 */
    function getBasicShell(callback) {

        const popover = document.querySelector("#popover");

        insertThumbnails(popover, blankThumbnails());

        popover.querySelectorAll('.js-infoSect').forEach(section => section.classList.add('hidden'));
        popover.querySelector('.js-wikiSearches').classList.remove('hidden');

        if (!callback)
            return popover;

        return callback(popover);
    }

    ////////////////// IMPLEMENTATION //////////////////

    function insertThumbnails(popover, thumbnails) {

        popover.querySelector('.js-wikiSearches').appendChild(thumbnails);

        return popover;
    }

	/**
	 * Generates blank thumbnails to use as placeholders while the content is being loaded.
	 * @param {number} quantity The quantity of thumbnails.
	 */
    function blankThumbnails(quantity = 6) {

        var fragment = document.createDocumentFragment();
        var template = document.querySelector("#blankThumbnails");

        for (let i = 0; i < quantity; i++) {

            var clonedTemplate = template.content.cloneNode(true);
            fragment.appendChild(clonedTemplate);
        }

        return fragment;
    }

})();