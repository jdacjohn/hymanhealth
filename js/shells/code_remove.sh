#!/bin/sh
cd ../
dir="code_v7"
echo "removing previous build..."
svn up
svn remove $dir --force
svn commit -m "removing $dir build"
