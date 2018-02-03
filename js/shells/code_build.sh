#!/bin/sh

echo "Building App Code..."
appname="app"
dir="code_v1"
version="0.1"
cd ../../util/buildscripts
java  -Xms1024m -Xmx1024m -classpath ../shrinksafe/js.jar:../shrinksafe/shrinksafe.jar org.mozilla.javascript.tools.shell.Main  build.js profileFile="../../html/$appname_profile.js" releaseDir="../../html/"$dir copyTests=false internStrings=true mini=true version=$version optimize="comments" layerOptimize=comments cssOptimize=comments.keepLines action=clean,release
