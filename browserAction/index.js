(async function () {
    'use strict';
    /**
     * 
     * @param {string} el 
     * @returns {HTMLElement} 
     */
    const q = el => document.querySelector(el);

    initDOMEvents();
    initDOMValues();
    initOnChangedEvents();


    function initDOMEvents() {
        q('#togglePopover').addEventListener('click', togglePopover);
        q('#openShortcuts').addEventListener('click', ev => openTab('chrome://extensions/configureCommands'));


        async function togglePopover() {
            const popoverState = await manager.retrieve('popover', 'isEnabled');
            const popover = await manager.update('popover').property('isEnabled', !popoverState);
        }
    }

    async function initDOMValues() {
        var popoverState = await manager.retrieve('popover', 'isEnabled');
        q('#togglePopover').textContent = popoverState ? 'Disable Popup' : 'Enable Popup';
    }

    function initOnChangedEvents() {

        chrome.storage.onChanged.addListener(changesListener);
        
        
        function changesListener(changes, areaName) {
            //Popover enabled state changed
            if (changes.popover) {
                q('#togglePopover').textContent = changes.popover.newValue.isEnabled ? 'Disable Popup' : 'Enable Popup';
            };
        }
    }

    function openTab(url) {
        chrome.tabs.create({ url: url });
    }

})();