(function () {
    "use strict";

    initializeDB();

    function initializeDB() {
        manager.retrieve('popover')
            .then(obj => {
                if (typeof obj !== 'object')
                    manager.update('popover').value({ isEnabled: true, shortcuts: [] });
            })
            .catch(error => manager.create({ 'popover':{isEnabled: true, shortcuts: [] }}));


        manager.retrieve('language').then(obj => {
            if (typeof obj !== 'object')
                manager.update('language').value('rel');
        });

        manager.retrieve('fallbackLanguage').then(obj => {
            if (typeof obj !== 'object')
                manager.update('fallbackLanguage').value('en');
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
            const isEnabled = await manager.retrieve('popover', 'isEnabled');
            manager.update('popover').property('isEnabled', !isEnabled);
        }

        function showPopup() {

        }

        commands[command]();

    });

}());