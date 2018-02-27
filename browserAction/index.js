(function () {
    'using strict';
    /**
     * 
     * @param {string} el 
     * @returns {HTMLElement} 
     */
    const el = (el) => document.querySelector(el);

    initEvents();
    updateElement();


    function initEvents() {
        el('#togglePopover').addEventListener('click', togglePopover);
        el('#openShortcuts').addEventListener('click', ev => openTab('chrome://extensions/configureCommands'));


        async function togglePopover() {
            const before = await manager.retrieve('popover');
            const popover = await manager.update({ key: 'popover', subkey: 'isEnabled', value: !before.isEnabled });
            updateElement('popoverState');
        }
    }

    async function updateElement(elId) {

        const elementsValue = {
            popoverState: async () => {
                const popover = await manager.retrieve('popover');
                el('#togglePopover').textContent = popover.isEnabled ? 'Disable Popup' : 'Enable Popup';
            }
        }

        if (elId)
            elementsValue[elId]();
        else
            Object.keys(elementsValue).forEach(key => elementsValue[key]());
    }

    function openTab(url) {
        chrome.tabs.create({ url: url });
    }

})();