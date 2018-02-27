(function () {
    "use strict";

    initializeDB();

    function initializeDB() {
        manager.retrieve('popover').then(obj => {
            if (typeof obj !== 'object')
                manager.update({ key: 'popover', value: { isEnabled: true, shortcuts: [] } });
        });

        manager.retrieve('language').then(obj => {
            if (typeof obj !== 'object')
                manager.update({ key: 'language', value: 'rel' });
        });
    }

    chrome.contextMenus.create({
        title: 'Search \"%s\" on Wikipedia',
        contexts: ["selection"],
        onclick: function (info) {
            const url = `http://www.wikipedia.org/w/index.php?title=Special:Search&search=${info.selectionText}`;
            chrome.tabs.create({ url: url });
        }

    });

    chrome.commands.onCommand.addListener(command => {
        const commands = {
            'toggle-popup': togglePopover,
            'show-popup': showPopup
        };
        
        async function togglePopover() {
            const before = await manager.retrieve('popover');
            const isEnabled = !before.isEnabled;
            manager.update({ key: 'popover', subkey: 'isEnabled', value: isEnabled });
        }

        function showPopup() {
            
        }

        commands[command]();
        
    });

})();