(function () {
    'using strict';
    /**
     * 
     * @param {string} el 
     * @returns {HTMLElement} 
     */
    const el = (el) => document.querySelector(el);

    initEvents();
    insertElements();


    function initEvents() {
        el('#togglePopover').addEventListener('click', togglePopover);


        togglePopover();
    }

    function insertElements() {

        togglePopover();

    }
    async function togglePopover() {
        const before = await manager.retrieve('popover');
        const isEnabled = !before.isEnabled;
        
        manager
            .update({ key: 'popover', subkey: 'isEnabled', value: isEnabled })
            .then(popover => el('#togglePopover').textContent = popover.isEnabled ? 'Disable Popup' : 'Enable Popup');
    }

})();