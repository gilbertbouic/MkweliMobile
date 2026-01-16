#!/bin/bash

# Fix image filename - Android resources must be lowercase

echo "Fixing image filename for Android compatibility..."

cd /home/gil/MkweliMobile/android/app/src/main/res/drawable

if [ -f "Mweli.webp" ]; then
    mv mkweli.webp mweli.webp
    echo "✓ Renamed Mweli.webp to mweli.webp"
else
    echo "✓ File already renamed or doesn't exist"
fi

ls -la

echo ""
echo "✓ Fix complete! Now run: ./build-and-run.sh"
