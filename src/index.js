const { Discover, Color } = require('yeelight-awesome');
const YeelightService = require('./yeelightService');
const { isDarkColor } = require('./colorUtils');
const { getCurrentMediaTitle, getPrimaryColor } = require('./mediaService');
const config = require('./config.json');
const logger = require('./logger');

const discovery = new Discover();
const yeelights = new Map();
let previousMedia = null;
let previousColor = null;

discovery.on('deviceAdded', async (device) => {
    const key = `${device.host}:${device.port}`;

    if (!yeelights.has(key)) {
        logger.info(`Discovered Yeelight: ${device.host}:${device.port}`);
        const lightService = new YeelightService(device.host, device.port);
        yeelights.set(key, lightService);
    }
});

async function updateLightColor() {
    try {
        const currentMedia = await getCurrentMediaTitle();

        if (currentMedia !== previousMedia) {
            previousMedia = currentMedia;
            const primaryColor = await getPrimaryColor();

            if (primaryColor) {
                let color = new Color(primaryColor[0], primaryColor[1], primaryColor[2]);
                logger.info(`Primary color: ${color.red}, ${color.green}, ${color.blue}`);

                await updateLightColorBasedOnColor(color);

                if (shouldUpdateColor.call(this, color)) {
                    previousColor = color;
                    await Promise.all(Array.from(yeelights.values()).map(light => light.setColor(color, config.transitionDuration)));
                }
            }
        }
    } catch (error) {
        logger.error(`Error checking media: ${error}`);
    }
}

function shouldUpdateColor(color) {
    return !previousColor || (color.red !== previousColor.red || color.green !== previousColor.green || color.blue !== previousColor.blue);
}

async function updateLightColorBasedOnColor(color) {
    if (isDarkColor(color, config.darkColorThreshold)) {
        color = new Color(config.darkYellowColor.red, config.darkYellowColor.green, config.darkYellowColor.blue);
        logger.info(`Color is dark. Setting lights to dimmed dark yellow: ${color.red}, ${color.green}, ${color.blue}`);
        await Promise.all(Array.from(yeelights.values()).map(light => light.setBrightness(config.dimBrightness, config.transitionDuration)));
    } else {
        logger.info(`Color is light. Setting lights to full brightness: ${color.red}, ${color.green}, ${color.blue}`);
        await Promise.all(Array.from(yeelights.values()).map(light => light.setBrightness(config.fullBrightness, config.transitionDuration)));
    }
}

setInterval(updateLightColor, config.pollingInterval);

discovery.start();

logger.info("Yeelight discovery started. Press Ctrl+C to stop.");