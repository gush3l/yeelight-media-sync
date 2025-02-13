const { Discover, Color } = require('yeelight-awesome');
const YeelightService = require('./yeelightService');
const { isDarkColor } = require('./colorUtils');
const { getCurrentMediaTitle, getPrimaryColor } = require('./mediaService');
const config = require('./config.json');
const logger = require('./logger');
const os = require('os');

const discovery = new Discover();
const yeelights = new Map();
const initialLightStates = new Map();
let previousMedia = null;
let previousColor = null;

if (os.platform() !== 'darwin') {
    logger.error("This project is only supported on macOS.");
    process.exit(1);
}

discovery.on('deviceAdded', async (device) => {
    const key = `${device.host}:${device.port}`;

    if (!yeelights.has(key)) {
        logger.info(`Discovered Yeelight: ${device.host}:${device.port}`);
        const lightService = new YeelightService(device.host, device.port);
        const deviceMode = device.mode;
        yeelights.set(key, lightService);
        try {
            const {colorTemperature, color, brightness } = await lightService.getState();
            initialLightStates.set(key, {deviceMode, colorTemperature, color, brightness});
            logger.info(`Stored initial state for ${device.host}:${device.port}: DeviceMode=${deviceMode}, ColorTemperature=${colorTemperature}, Color=${color.red}, ${color.green}, ${color.blue}, Brightness=${brightness}`);
        } catch (error) {
            logger.error(`Failed to get initial state for ${device.host}:${device.port}: ${error}`);
        }
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

process.on('SIGINT', () => {
    logger.info("Stopping Yeelight Media Sync...");
    Promise.all(Array.from(yeelights.values()).map(async (light) => {
        const key = `${light.lightIp}:${light.lightPort}`;
        const initialState = initialLightStates.get(key);

        if (initialState) {
            if (initialState.deviceMode === 1) {
                await light.setColorTemperature(initialState.colorTemperature, config.transitionDuration);
                logger.info(`Restored initial state for ${key} to Color Temperature=${initialState.colorTemperature}, Brightness=${initialState.brightness}`);
            } else if (initialState.deviceMode === 2) {
                await light.setColor(initialState.color, config.transitionDuration);
                logger.info(`Restored initial state for ${key} to Color=${initialState.color.red}, ${initialState.color.green}, ${initialState.color.blue}, Brightness=${initialState.brightness}`);
            }
            await light.setBrightness(initialState.brightness, config.transitionDuration);
        } else {
            await light.setColorTemperature(4000, config.transitionDuration);
            await light.setBrightness(100, config.transitionDuration);
            logger.warn(`No initial state found for ${key}. Reverting to default color temperature 4000 and 100 brightness.`);
        }
    })).then(() => {
        logger.info("Yeelight Media Sync stopped.");
        process.exit(0);
    });
});