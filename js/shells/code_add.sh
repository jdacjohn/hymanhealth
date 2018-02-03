#!/bin/sh
cd ../
dir="code_v1"
echo "removing themes..."
rm -rf $dir"/dojo/dijit/themes/nihilo"
rm -rf $dir"/dojo/dijit/themes/tundra"
rm -rf $dir"/dojo/dijit/themes/soria"
echo "adding $dir build..."
svn add $dir
