#!/bin/sh
last=1
cache=2
lastversion="0.1"
version="0.2"

cd ../

if [ $lastversion != $version ]
then
vcmd="s/$lastversion/$version/"
echo $vcmd
perl -pi -e $vcmd code_build.sh
else
echo "Not changing code version"
fi

if [ $last != $cache ]
then
echo "new version:"$cache
export svnversion=`svnversion .`
cmd="s/code_v$last/code_v$cache/g"
echo $cmd
perl -pi -e $cmd shells/code_build.sh
perl -pi -e $cmd shells/code_add.sh
perl -pi -e $cmd shells/code_remove.sh
perl -pi -e $cmd index.html
else
echo "Not changing cache $cache"
fi
