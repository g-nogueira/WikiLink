(function () {
    'using strict';

    const repo = require('./repository');
    const url = require('url');
    const http = require('http');

    http.createServer((req, res) => {
        res.writeHead(200, {
            'Content-type': 'application/json',
            'Access-Control-Allow-Origin': '*', //The allowed origin that can make requests
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE', //The allowed http methods
            'Access-Control-Max-Age': 300,
            'Access-Control-Allow-Headers': '*'
        });
        const query = url.parse(req.url, true).query;
        if (repo.methods[query.m]) {
            const resp = repo.methods[query.m](query.v);
            res.end(JSON.stringify(resp));
        }
    }).listen(8081);


})();