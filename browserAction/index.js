(async function () {
    'use strict';
    /**
     * Shorthand function for querySelector
     * @param {string} el 
     * @returns {HTMLElement} 
     */
    const DOM = el => document.querySelector(el);

    initializer().DOMEvents()
    initializer().elementsValues()
    initializer().storageEvents()


    
    ////////////////// IMPLEMENTATION //////////////////

    function initializer() {

        /**
         * Initializes DOM events listeners
         */
        function DOMEvents() {

            DOM('#togglePopover').addEventListener('click', toggleDOMPopover);
            DOM('#openShortcuts').addEventListener('click', ev => openTab('chrome://extensions/configureCommands'));


            var toggleDOMPopover = async () => {
                const popoverState = await manager.retrieve('popover', 'isEnabled');
                manager.update('popover').property('isEnabled', !popoverState);
            }
        }

        /**
         * Initializes DOM Elements values
         */
        async function elementsValues() {

            manager.retrieve('popover', 'isEnabled').then(popoverState => {
                DOM('#togglePopover').textContent = popoverState ? 'Disable Popup' : 'Enable Popup';
            });

        }

        /**
         * Initializes storage changes listeners.
         */
        function storageEvents() {

            manager.changesListener('popover').execute(popoverOnChange);

            var popoverOnChange = (oldV, newV) => {
                DOM('#togglePopover').textContent = newV.isEnabled ? 'Disable Popup' : 'Enable Popup';
            }
        }

        return { DOMEvents, elementsValues, storageEvents };
    }

    function openTab(url) {
        chrome.tabs.create({ url: url });
    }

})();