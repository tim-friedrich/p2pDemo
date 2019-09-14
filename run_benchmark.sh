
declare -a arr=(
	#"testfiles/1mb"
	# "testfiles/5mb"
	# "testfiles/10mb"
	# "testfiles/20mb"
	# "testfiles/30mb"
	# "testfiles/40mb"
	# "testfiles/50mb"
	# "testfiles/60mb"
	# "testfiles/70mb"
	# "testfiles/80mb"
	# "testfiles/90mb"
	# "testfiles/100mb"
	# "testfiles/120mb"
	# "testfiles/140mb"
	# "testfiles/160mb"
	# "testfiles/180mb"
	 "testfiles/200mb"
	)

for i in "${arr[@]}"
do
   echo "starting to benchmark $i"
	 for n in {1..10}; do
		 echo "run $n"
	 	node benchmarks/run.js "$i"
	 done
   # or do whatever with individual element of the array
done
# for n in {1..10}; do
# 	node benchmarks/run.js
# done
