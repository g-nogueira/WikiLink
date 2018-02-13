(function () {
    'using strict';

    const franc = require('franc-min');

    class Repository {
        constructor() {
            this.methods = {
                language: this.langIdentification,
                en_oauth: this.evernote,
                en_login: this.evernoteLogin

            };
        }

        langIdentification(extract) {
            const regexUTF8 = /([^\u0000-\u0040\u005B-\u0060\u007B-\u00BF\u02B0-\u036F\u00D7\u00F7\u2000-\u2BFF])+/g;
            const text = extract.match(regexUTF8).toString();
            const whitelist = ['por', 'eng', 'spa', 'deu', 'fra', 'ita', 'rus'];
            const francRes = { language: franc(extract, { whitelist: whitelist }) };
            const languages = {
                por: 'pt', eng: 'en', spa: 'es', deu: 'de',
                fra: 'fr', ita: 'it', rus: 'ru'
            };


            return { language: languages[francRes.language] };
        }
    }

    const repository = new Repository();
    module.exports = repository;
})();