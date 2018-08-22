'use strict';

/***************************************************
 *      This file contains the Http Class.  📬     *
 *                                                 *
 * The Http Class executes the basic http methods  *
 * (get, post, put, delete) and  RETURNS a promise *
 * a promise with the pending response.            *
 **************************************************/

class Http {
    constructor() { }

    get(url) {
        return this.httpExecute('GET', url);
    }
    post(url, data) {
        return this.httpExecute('POST', url, data);
    }
    put(url, data) {
        return this.httpExecute('PUT', url, data);
    }
    delete(url) {
        return this.httpExecute('DELETE', url);
    }

    httpExecute(method, url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            xhr.onload = () => resolve(xhr.responseText);
            xhr.onerror = () => reject(xhr);
            xhr.send();
        });
    }
}

const http = new Http();