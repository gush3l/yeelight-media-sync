const Reset = "\x1b[0m";
const ForegroundRed = "\x1b[31m";
const ForegroundGreen = "\x1b[32m";
const ForegroundYellow = "\x1b[33m";
const ForegroundCyanColor = "\x1b[36m";
const ForegroundWhite = "\x1b[37m";
const ForegroundGrayColor = "\x1b[90m";

class Logger {
    constructor() {}

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        let typeColor = Reset;

        let typeSymbol = "";

        switch (type) {
            case 'INFO':
                typeColor = ForegroundGreen;
                typeSymbol = "ℹ️ ";
                break;
            case 'WARN':
                typeColor = ForegroundYellow;
                typeSymbol = "❕";
                break;
            case 'ERROR':
                typeColor = ForegroundRed;
                typeSymbol = "❌";
                break;
            default:
                typeColor = ForegroundCyanColor;
                typeSymbol = "❓";
        }

        const logMessage = `${ForegroundGrayColor}[${timestamp}]${Reset} ${typeColor}${typeSymbol} [${type}]${Reset} ${ForegroundWhite}${message}${Reset}\n`;

        console.log(logMessage);
    }

    info(message) {
        this.log(message, 'INFO');
    }

    warn(message) {
        this.log(message, 'WARN');
    }

    error(message) {
        this.log(message, 'ERROR');
    }
}

module.exports = new Logger();