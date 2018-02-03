#!/bin/sh
echo "Building TEMP..."
dir="code_v7"
cd ../util/buildscripts
java  -Xms1024m -Xmx1024m -classpath ../shrinksafe/js.jar:../shrinksafe/shrinksafe.jar org.mozilla.javascript.tools.shell.Main  build.js profileFile=../../html/vls_profile.js releaseDir=../../html/TEMP copyTests=false internStrings=true mini=true version=1.0 optimize="comments" cssOptimize=comments.keepLines action=clean,release
cd ../../html
echo "copying vls.css, vls.uncompressed.js, and vls.js"

cp TEMP/dojo/css/vls.css $dir"/dojo/css/vls.css"
cp TEMP/dojo/css/dojo.css $dir"/dojo/css/dojo.css"

cp TEMP/dojo/dojo/dojo.js.uncompressed.js $dir"/dojo/dojo/dojo.js.uncompressed.js"
cp TEMP/dojo/dojo/dojo.js $dir"/dojo/dojo/dojo.js"

cp TEMP/dojo/dojo/vls.js.uncompressed.js $dir"/dojo/dojo/vls.js.uncompressed.js"
cp TEMP/dojo/dojo/vls.js $dir"/dojo/dojo/vls.js"

echo "Removing TEMP dir"
rm -rf TEMP
