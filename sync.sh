#!/bin/bash

s3cmd=/usr/local/bin/s3cmd
localparentdir=1
bucket=$2
bucketdir=$3

remotedest="s3://${bucket}/${bucketdir}/"
synclog=/var/log/gopro-grab/sync.log
errorlog=/var/log/gopro-grab/error.log

if [[ ! $localparentdir ]] || [[ ! $bucket ]] || [[ ! $bucketdir ]]; then
  printf "Usage: ./sync.sh <directory path on computer that has directories to be synced, e.g. /usr/share/nginx/html> <bucket name> <bucket directory>\n\nThis script depends on the s3cmd auth already having been done.";
  exit 1;
fi

echo "--START--" >> "${synclog}"
echo "--START--" >> "${errorlog}"
date >> "${synclog}"
date >> "${errorlog}"
echo "From ${localparentdir} to ${remotedest}" >> "${synclog}"
"${s3cmd}" sync --acl-public --delete-after --exclude '.git/' "${localparentdir}" "${remotedest}" >> "${synclog}" 2>> "${errorlog}"
date >> "${synclog}"
date >> "${errorlog}"
echo "--END--" >> "${synclog}"
echo "--END--" >> "${errorlog}"
