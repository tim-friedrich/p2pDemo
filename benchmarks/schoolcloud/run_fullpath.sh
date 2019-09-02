declare -a arr=(60)

for i in "${arr[@]}"
do
   echo "starting to benchmark $i"
	 for n in {1..2}; do
		 echo "run $n"
	 	 node full-path.js "$n" "$i"
	 done
   # or do whatever with individual element of the array
done
