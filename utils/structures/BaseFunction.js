const Logger = require('../services/logger')

module.exports = class BaseFunction {
    constructor(name, category, description, messages) {
        this.name = name;
        this.category = category;
        this.description = description;
        this.messages = messages;
        this.consoleLogger = new Logger(name);
        this.openaiFunction = undefined;
    }

    async run() {
        return [false, "Not implemented yet", false];
    }

    log(message, logData = undefined) {
        logData ? this.consoleLogger.log(message, 'info') : this.consoleLogger.log(message, 'info', logData);
    }
    error(message, logData = undefined) {
        logData ? this.consoleLogger.log(message, 'error') : this.consoleLogger.log(message, 'error', logData);
    }
    warn(message, logData = undefined) {
        logData ? this.consoleLogger.log(message, 'warn') : this.consoleLogger.log(message, 'warning', logData);
    }
}