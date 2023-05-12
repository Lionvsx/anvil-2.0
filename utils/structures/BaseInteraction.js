const Logger = require('../services/logger')

module.exports = class BaseInteraction {
    constructor(name, category, type, config) {
        this.name = name;
        this.category = category;
        this.type = type;
        this.config = config;
        this.consoleLogger = new Logger(name);
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