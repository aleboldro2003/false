const Jimp = require('jimp');

async function main() {
    try {
        const imagePath = "/Users/zunza/.gemini/antigravity/brain/17aa0e5b-bcb7-4da5-b219-1cf60c09131d/splash_options_v5_1771971422014.png";

        console.log(`Reading image: ${imagePath}`);
        const image = await Jimp.read(imagePath);

        // Original image is 640x640. 
        // 3rd phone center is roughly at X: 533, Y: 320
        // We crop a tight area (160x340) directly from the center of the 3rd screen to avoid all bezels.
        const cropW = 160;
        const cropH = 340;
        const cropX = 533 - (cropW / 2); // 453
        const cropY = 320 - (cropH / 2); // 150

        console.log(`Performing tight crop (x: ${cropX}, w: ${cropW}, y: ${cropY}, h: ${cropH})`);
        const cropped = image.crop(cropX, cropY, cropW, cropH);

        const outPath = "./assets/images/splash.png";
        await cropped.writeAsync(outPath);
        console.log(`Successfully performed tight crop and saved to ${outPath}`);
    } catch (e) {
        console.error("Error cropping image:", e);
        process.exit(1);
    }
}

main();
