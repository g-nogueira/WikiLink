'use strict';

function sendMessage(receiver, functionName, params) {
    var msg = {};
    msg.receiver = receiver;
    msg.fnName = functionName;
    msg.params = params;

    return new Promise((resolve, reject) => chrome.runtime.sendMessage(msg, response => resolve(response)))
}