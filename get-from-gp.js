#!/usr/bin/env node

var cheerio = require('cheerio');
var fs = require('fs');
var { Readable } = require('stream');
var { finished } = require('stream/promises');

const goProBaseURL = 'http://10.5.5.9:8080/videos/DCIM/';
const localMediaDir = 'local-media';

(async function go() {
  try {
    var res = await fetch(goProBaseURL);
    const html = await res.text();
    var $ = cheerio.load(html);
    var dirLinks = $('a.link');
    var latestDirLink = getLatestDirLink(dirLinks);
    if (!latestDirLink) {
      throw new Error('Could not find a GoPro directiory link.');
    }
    console.log('Found latest directory.');
    const dirURL = `${goProBaseURL}${latestDirLink.attribs.href}`;
    res = await fetch(dirURL);
    const photoDirHTML = await res.text();
    $ = cheerio.load(photoDirHTML);
    var photoLinks = $('a.link');
    console.log('Found', photoLinks.length, 'photo links.');
    console.log('Starting downloads.');
    var dlResults = await downloadPhotosAtLinks(dirURL, photoLinks);
    console.log('Done.')
    console.log(JSON.stringify(dlResults, null, 2));
  } catch (error) {
    console.error(error);
  }
})();

function getLatestDirLink(links) {
  if (links.length < 1) {
    return;
  }

  var latest = links[0];
  // links is not an Array.
  for (let i = 1; i < links.length; ++i) {
    var current = links[i];
    latest = getLaterLink(current, latest);
  }

  return latest;
}

function getLaterLink(a, b) {
  const aNumber = getPrefixNumberFromText(a.attribs.href);
  const bNumber = getPrefixNumberFromText(b.attribs.href);
  if (aNumber > bNumber) {
    return a;
  }
  return b;
}

function getPrefixNumberFromText(text) {
  return text.match(/^\d+/)?.[0];
}

function downloadPhotosAtLinks(baseURL, links) {
  var dlPromises = [];
  for (let i = 0; i < links.length; ++i) {
    dlPromises.push(downloadIfNecessary(baseURL, links[i]));
  }
  return Promise.allSettled(dlPromises);
}

// throws
async function downloadIfNecessary(baseURL, link) {
  const filename = link.attribs.href;
  const filePath = `${localMediaDir}/${filename}`;
  if (fs.existsSync(filePath)) {
    return { file: filePath, state: 'skipped' };
  }

  console.log('Downloading', filename);

  try {
    let res = await fetch(`${baseURL}${filename}`);
    const fileStream = fs.createWriteStream(filePath, { flags: 'wx' });
    await finished(
      Readable.fromWeb(res.body)
      .pipe(fileStream)
    );
    return { file: filePath, state: 'downloaded' };
  } catch (error) {
    return { file: filePath, state: 'error', errorMsg: error.message };
  }
}

