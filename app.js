const express = require('express');
const redis = require('./redis').redis;
const app = express();

app.get('/', (req, res) => {
    res.send('Hello world!');
});

app.get('/api/value', (req, res) => {
    redis.get('value', (err, value) => {
        if (err) {
            return res.status(500).send('error');
        }

        res.status(200).json({
            value
        });
    });
});

module.exports = app;