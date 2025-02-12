const logger = require('./logger');

function isDarkColor(color, threshold) {
    const brightness = (color.red * 299 + color.green * 587 + color.blue * 114) / 1000;
    logger.info(`Brightness: ${brightness}, Threshold: ${threshold}, Color: ${color.red}, ${color.green}, ${color.blue}`);
    return brightness < threshold;
}

module.exports = {
    isDarkColor,
};