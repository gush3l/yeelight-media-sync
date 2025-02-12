const logger = require('./logger');
const { Yeelight } = require('yeelight-awesome');

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
}

module.exports = YeelightService;