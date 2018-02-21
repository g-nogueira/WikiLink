(function () {
    'using strict';
    /**
     * 
     * @param {string} el 
     * @returns {HTMLElement} 
     */
    const el = (el) => document.querySelector(el);

    initEvents();
    insertTexts();


    function initEvents() {
        el('#togglePopup').addEventListener('click', togglePopup);


        async function togglePopup() {
            const before = await manager.retrieve('popover');;
            const popover = await manager.update({ key: 'popover', subkey: 'isEnabled', value: !before.isEnabled });
            togglePopupText();
        }
    }

    function insertTexts() {

        togglePopupText();

    }
    async function togglePopupText() {
        const popover = await manager.retrieve('popover');
        const isEnabled = popover.isEnabled;
        el('#togglePopup').textContent = isEnabled ? 'Disable Popup' : 'Enable Popup';
    }

})();