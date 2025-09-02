// Debug script to instrument path-to-regexp to find which path is parsed
const p2r = require('path-to-regexp');
const originalParse = p2r.parse;

p2r.parse = function (str) {
  console.log('[path-to-regexp] parse called with:', str);
  return originalParse(str);
};

const express = require('express');
const path = require('path');

const app = express();

const distPath = path.join(__dirname, '..', 'dist', 'spa');
console.log('Static path:', distPath);

app.use(express.static(distPath));
app.get('*', (req, res) => res.send('ok'));

app.listen(3001, () => console.log('listening'));
