(async function () {
    'use strict';
    /**
     * Shorthand function for querySelector
     * @param {string} el 
     * @returns {HTMLElement} 
     */
    const DOM = el => document.body.querySelector(el);

    initializer().DOMEvents()
    initializer().elementsValues()
    initializer().storageEvents()


    
    ////////////////// IMPLEMENTATION //////////////////

    function initializer() {

        /**
         * Initializes DOM events listeners
         */
        function DOMEvents() {

            DOM('.js-popoverButton ').addEventListener('click', toggleDOMPopover);
            // DOM('.js-shortcutsButton').addEventListener('click', ev => chrome.runtime.openOptionsPage());
            DOM('.js-shortcutsButton').addEventListener('click', ev => chrome.windows.create({url: '../optionsPage/index.html', type: 'popup', width: 500,  height: 500}));
            DOM('.js-optionsButton').addEventListener('click', ev => chrome.windows.create({url: '../optionsPage/index.html', type: 'popup', width: 500,  height: 500}));
            // DOM('.js-shortcutsButton').addEventListener('click', ev => openTab('chrome://extensions/configureCommands'));

            async function toggleDOMPopover () {
                const popoverState = await popoverDB.retrieve('isEnabled');
                popoverDB.update('isEnabled', !popoverState);
            }

        }

        /**
         * Initializes DOM Elements values
         */
        async function elementsValues() {

            popoverDB.retrieve('isEnabled').then(popoverState => {
                DOM('.js-popoverButton ').textContent = popoverState ? 'Disable Popup' : 'Enable Popup';
            });

        }

        /**
         * Initializes storage changes listeners.
         */
        function storageEvents() {

            popoverDB.watchChanges().then(popoverOnChange);

            function popoverOnChange (oldV, newV) {
                DOM('.js-popoverButton ').textContent = newV.isEnabled ? 'Disable Popup' : 'Enable Popup';
            }
        }

        return { DOMEvents, elementsValues, storageEvents };
    }

    function openTab(url) {
        chrome.tabs.create({ url: url });
    }

}());