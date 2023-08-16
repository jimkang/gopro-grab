#!/bin/bash

filename=local-media/$(date +'%Y-%m-%d-%H:%M:%S').jpg
fswebcam -r 640x480 --jpeg 90 -d /dev/video4 -S 30 "${filename}"

/home/jimkang/.nvm/versions/node/v18.16.1/bin/node make-indexes.js local-media
