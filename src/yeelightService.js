const logger = require('./logger');
const { Yeelight, Color } = require('yeelight-awesome');

class YeelightService {
    constructor(lightIp, lightPort) {
        this.lightIp = lightIp;
        this.lightPort = lightPort;
        this.light = new Yeelight({ lightIp: this.lightIp, lightPort: this.lightPort });
        this.isConnected = false;
    }

    async connect() {
        try {
            if (!this.isConnected) {
                await this.light.connect();
                this.isConnected = true;
                logger.info(`Connected to Yeelight at ${this.lightIp}`);
            }
        } catch (error) {
            logger.error(`Failed to connect to ${this.lightIp}: ${error}`);
            this.isConnected = false;
            throw error;
        }
    }

    async getState() {
        try {
            await this.connect();
            const properties = (await this.light.getProperty(['ct', 'rgb', 'bright'])).result.result;
            const ct = properties[0] ? parseInt(properties[0], 10) : 0;
            const rgb = properties[0] ? parseInt(properties[1], 10) : 0;
            const bright = properties[1] ? parseInt(properties[2], 10) : 0;

            return {
                colorTemperature: ct,
                color: new Color(
                    (rgb >> 16) & 0xFF,
                    (rgb >> 8) & 0xFF,
                    rgb & 0xFF
                ),
                brightness: bright
            };
        } catch (error) {
            logger.error(`Failed to get state for ${this.lightIp}: ${error}`);
            throw error;
        }
    }

    async setBrightness(brightness, transitionDuration) {
        try {
            await this.connect();
            await this.light.setBright(brightness, 'smooth', transitionDuration);
        } catch (error) {
            logger.error(`Failed to set brightness for ${this.lightIp}: ${error}`);
            throw error;
        }
    }

    async setColor(color, transitionDuration) {
        try {
            await this.connect();
            await this.light.setRGB(color, 'smooth', transitionDuration);
        } catch (error) {
            logger.error(`Failed to set color for ${this.lightIp}: ${error}`);
            throw error;
        }
    }

    async setColorTemperature(colorTemperature, transitionDuration) {
        try {
            await this.connect();
            await this.light.setCtAbx(colorTemperature, 'smooth', transitionDuration);
        } catch (error) {
            logger.error(`Failed to set color temperature for ${this.lightIp}: ${error}`);
            throw error;
        }
    }
}

module.exports = YeelightService;