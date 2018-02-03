#!/bin/sh

showOptions () {
	echo "Incorrect switches"
	echo "	first arg:"
	echo "		Commit message or keyword"
	echo "			keywords:"
	echo "				date"
	echo ""
	echo "	second arg"
	echo "		Commit type"
	echo "			C: dev comment"
	echo "			F: new feature"
	echo "			B: fixed bug"
	echo "			M: fixed minor bug (most common)"
	echo "			I: improved feature"
	echo "			R: removed feature"
	echo "			K: known bug"
	echo ""
	echo "	third arg (anything)"
	echo "		Full build"
}

if [ ! "$1" ]; then showOptions; exit; fi


if [ "$1" == "date" ]
then
echo "Add date stamp"
dt="`eval date +%m-%d-%Y`"
tm="`eval date +%R`"
echo "Date: "$dt

echo "\n [ $dt ]" >> CommitLogs.txt
exit
fi

if [ ! "$2" ]; then echo "FAIL - No commit type"; exit; fi

cd ../

if [ ! "$3" ]
then
./shells/temp_build.sh
else
./shells/code_remove.sh
./shells/code_build.sh
./shells/code_add.sh
fi

export s=`svnversion .`
export version=`echo $s |cut -c5-7`
export version=`expr $version + 1`
doboth=true
if [ $2 = "C" ]; then
sym="     #"
doboth=false
elif [ $2 = "F" ]; then
sym="+"
elif [ $2 = "B" ]; then
sym="!"
elif [ $2 = "M" ]; then
sym="     !"
doboth=false
elif [ $2 = "I" ]; then
sym="*"
elif [ $2 = "R" ]; then
sym="-"
elif [ $2 = "K" ]; then
sym="~"
fi

echo " $sym $1 [ $version ]" >> CommitLogs.txt

svn commit -m "$1"

# = comment
# + = new feature
# * = improved feature
# ! = fixed bug
# - = removed feature
# ~ = declaration of known bug
