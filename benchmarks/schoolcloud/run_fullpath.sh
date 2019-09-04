declare -a arr=(1 5 10 30 60 90 120)
# declare -a arr=(10)

for i in "${arr[@]}"
do
   echo "starting to benchmark $i"
	 for n in {1..3}; do
		 echo "run $n"
     echo "range $i"
     rm traces/trace_*
	 	 node full-path.js "$n" "$i"
	 done
   # or do whatever with individual element of the array
done
