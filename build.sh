#!/usr/bin/env bash

cd $(dirname "$0")

OUT_FILE='js13k-404.zip'
MAX_SIZE=13312
TERSER="$HOME/.node/bin/terser"

if [ -d 'build' ]; then
	rm -r 'build'
fi

mkdir -p 'build/levels'
mkdir -p 'build/ui'

cp 'dev/index-dev.html' 'build/'
cp 'dev/js/'*.js 'build/'
cp 'dev/js/levels/'*.js 'build/levels/'
cp 'dev/js/ui/'*.js 'build/ui/'

cd 'build' > '/dev/null'

# Remove line-breaks from HTML file.
tr -d '\n' < 'index-dev.html' > 'index.html'

# Remove the single JS files and only include the minified one.
sed -i'' 's/js\/js13k\.js/i.js/' 'index.html'
sed -E -i'' 's/<script src="([a-zA-Z0-9_-]+\/)?[a-zA-Z0-9_.-]{2,}\.js"><\/script>//g' 'index.html'

# Minify and combine the JS files.
$TERSER \
	'js13k.js' \
	'Character.js' \
	'Input.js' \
	'Level.js' \
	'levels/Intro.js' \
	'Renderer.js' \
	'UI.js' \
	'ui/Text.js' \
	--ecma 6 --warn \
	--compress --toplevel \
	--mangle \
	-o 'i.js'

sed -i'' 's/^"use strict";//' 'i.js'

rm 'index-dev.html'
find -type f -name '*.js' -not -name 'i.js' -delete

# ZIP up everything needed.
# 9: highest compression level
zip -9 -q -r "$OUT_FILE" ./*

# Further optimize the compression.
# advzip can be installed from the "advancecomp" package.
# 4: best compression
# i: additional iterations
advzip -q -z -4 -i 20 "$OUT_FILE"
# Test integrity of file.
# STDOUT(1) is just the file name.
# STDERR(2) shows actual errors, if there are some.
advzip -t -p "$OUT_FILE" 1> /dev/null

CURRENT_SIZE=$( stat --printf="%s" "$OUT_FILE" )
printf '  - Max size: %5d bytes\n' "$MAX_SIZE"
printf '  - ZIP size: %5d bytes\n' "$CURRENT_SIZE"

echo '  - Done.'
