#!/usr/bin/env node

/* global process */

var fs = require('fs');
var imgFileExts = ['png', 'jpg'];

if (process.argv.length < 3) {
  console.error(
    'Usage: node make-index.js <directory with images>'
  );
  process.exit(1);
}

const imgDirPath = process.argv[2];

var files = fs.readdirSync(imgDirPath).filter(probablyAnImageFile);
const imagesPerPage = 48;
const pageCount = Math.ceil(files.length/imagesPerPage);
console.log('Need to make', pageCount, 'pages');
var pages = [];
for (let page = 0; page < pageCount; ++page) {
  pages.push(files.slice(page * imagesPerPage, (page + 1) * imagesPerPage));
}
pages.forEach(writePage);

function writePage(pageFiles, i) {
  console.log('Writing', pageFiles.length, 'to page', i);
  const html = `<html>
<head>
  <title>Images page ${i}</title>
</head>
<body>
  <ul>
    ${pageFiles.map(file => '<li><img src="https://smidgeo.nyc3.cdn.digitaloceanspaces.com/check/lw/' + file + '"></li>').join('\n')}
  </ul>
  <a href="page-${i + 1}.html">Next page: ${i + 1}</a>
</body>
</html>`;
  fs.writeFile(`indexes/page-${i}.html`, html, { encoding: 'utf8' }, console.error);
}

function probablyAnImageFile(file) {
  return imgFileExts.some((ext) => file.endsWith('.' + ext));
}
