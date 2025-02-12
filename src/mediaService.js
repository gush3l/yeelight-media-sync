const { execSync } = require('child_process');
const { getThumbnailPrimaryColor } = require('./getThumbnail');
const logger = require('./logger');

async function getCurrentMediaTitle() {
    try {
        const output = execSync('nowplaying-cli get title');
        return output.toString().trim();
    } catch (error) {
        logger.error(`Error retrieving current media title: ${error}`);
        return null;
    }
}

async function getPrimaryColor() {
    try {
        return await getThumbnailPrimaryColor();
    } catch (error) {
        logger.error(`Error retrieving primary color: ${error}`);
        return null;
    }
}

module.exports = {
    getCurrentMediaTitle,
    getPrimaryColor,
};