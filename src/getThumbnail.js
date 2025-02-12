const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ColorThief = require('colorthief');
const logger = require('./logger');

const TEMP_FILE_PREFIX = 'temp_thumbnail';
const TEMP_FILE_EXT = '.jpg';

function getThumbnailBase64() {
    try {
        const output = execSync('nowplaying-cli get artworkData');
        return output.toString().trim();
    } catch (error) {
        logger.error(`Error retrieving thumbnail: ${error}`);
        return null;
    }
}

async function getThumbnailPrimaryColor() {
    let tempFilePath = null;
    try {
        const base64String = getThumbnailBase64();
        if (!base64String) return null;

        const buffer = Buffer.from(base64String, 'base64');
        tempFilePath = path.join(__dirname, `${TEMP_FILE_PREFIX}_${Date.now()}${TEMP_FILE_EXT}`);
        fs.writeFileSync(tempFilePath, buffer);

        try {
            const color = await ColorThief.getColor(tempFilePath);
            logger.info(`Color extracted successfully from ${tempFilePath}`);
            return color;
        } catch (err) {
            logger.error(`Error extracting color from thumbnail: ${err}`);
            if (err.message.includes('Input file contains unsupported image format')) {
                logger.warn(`Unsupported image format. Skipping color extraction.`);
                return null;
            } else {
                throw err;
            }
        }
    } catch (error) {
        logger.error(`Error getting thumbnail primary color: ${error}`);
        return null;
    } finally {
        if (tempFilePath) {
            try {
                fs.unlinkSync(tempFilePath);
                logger.info(`Successfully deleted temporary file: ${tempFilePath}`);
            } catch (unlinkError) {
                logger.warn(`Failed to delete temporary file ${tempFilePath}: ${unlinkError}`);
            }
        }
    }
}

if (require.main === module) {
    const base64String = getThumbnailBase64();
    if (base64String) {
        const imageBuffer = Buffer.from(base64String, 'base64');
        const filePath = path.join(__dirname, '..', 'thumbnail.jpg');
        fs.writeFileSync(filePath, imageBuffer);
        logger.info(`Thumbnail saved at: ${filePath}`);
    }

    getThumbnailPrimaryColor().then((color) => {
        if (color) {
            logger.info(`Primary color: ${color[0]}, ${color[1]}, ${color[2]}`);
        } else {
            logger.warn('No primary color extracted.');
        }
    });
}

module.exports = {
    getThumbnailBase64,
    getThumbnailPrimaryColor,
};