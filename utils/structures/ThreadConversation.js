const {ThreadAutoArchiveDuration} = require("discord.js");
const Logger = require("../services/Logger");
module.exports = class ThreadConversation {
    constructor(baseChannel, operation, messages) {
        this.messages = messages;
        this.baseChannel = baseChannel;
        this.channel = undefined;
        this.targetOperation = operation;
        this.consoleLogger = new Logger(operation.name);
    }

    async init(name, reason) {
        this.channel = await this.baseChannel.threads.create({
            name: name,
            autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
            reason: reason
        });
    }

    callGPT(client, model) {
        return new Promise(async (resolve, reject) => {
            try {
                let chatCompletion = await client.openAIAgent.createChatCompletion({
                    model: model,
                    messages: this.messages,
                    functions: [this.targetOperation.openaiFunction],
                    function_call: 'auto'
                });
                resolve(chatCompletion.data.choices[0]);
            } catch (e) {
                this.error(`Error while calling GPT: ${e}`)
                reject(e);
            }
        });
    }

    async startConversation(client, message) {
        try {
            let response = await this.callGPT(client, "gpt-3.5-turbo");
            if (response.finish_reason === "function_call") {
                await this.delete();
                this.log(`Triggered function ${this.targetOperation.name} with arguments ${JSON.stringify(response.message.function_call.arguments)}`);
                let [continue_instruction, result, error] = await this.targetOperation.run(client, message.guild, JSON.parse(response.message.function_call.arguments));
                if (error) {
                    this.messages.push({role: "function", name: this.targetOperation.name, content: result});
                    this.error(`Error while executing operation: ${this.targetOperation.name} | ${result}`);
                    return await this.startConversation(client, message);
                }
                return [continue_instruction, result, error];
            } else {
                await this.sendMessage(response.message.content);
                let filter = m => m.author.id === message.author.id;
                let collected = await this.channel.awaitMessages({filter, max: 1, time: 60_000, errors: ['time']})
                    .catch(() => {
                        return [true, "User did not respond the 60 seconds time", true]
                    })
                client.messageHistory[message.channel.id].push({role: "user", content: collected.first().content});
                this.messages.push({role: "user", content: collected.first().content});
                return await this.startConversation(client, message);
            }
        } catch (e) {
            this.error(`Error in thread conversation: ${e}`);
            return [true, `Error while starting conversation: ${e}`, true];
        }
    }



    async sendMessage(message) {
        if (this.channel === undefined) await this.init("conversation with anvil", "Anvil needs more information to perform this operation");
        this.messages.push({role: "assistant", content: message});
        await this.channel.send(message);
    }


    async delete() {
        if (this.channel === undefined) return;
        await this.channel.delete();
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