(function (){
    'use strict';
    const q = elem => document.querySelector(elem);
    const els = elem => document.querySelectorAll(elem);

    name();

    function name() {
        const shortcuts = els('.self-js-showKey');
        shortcuts.forEach(el => {
            el.addEventListener('keypress', ev => {
                ev.currentTarget.textContent += `+ ${String.fromCharCode(ev.charCode)}`;
            });
        });
    }
})();