const {ThreadAutoArchiveDuration, BaseGuildTextChannel, EmbedBuilder} = require("discord.js");
const Logger = require("../services/Logger");


module.exports = class ThreadConversation {
    /**
     *
     * @param baseChannel {BaseGuildTextChannel}
     * @param operation {BaseFunction}
     * @param conversation {Conversation}
     */
    constructor(baseChannel, operation, conversation) {
        this.messages = conversation.messages;
        this.baseChannel = baseChannel;
        this.channel = undefined;
        this.targetOperation = operation;
        this.consoleLogger = new Logger(`ai_thread_${operation.name}`);
        this.parentConversation = conversation;
        this.utilFunctions = undefined;
    }

    async init(name, reason, client) {
        this.channel = await this.baseChannel.threads.create({
            name: name,
            autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
            reason: reason
        });

        let embed = new EmbedBuilder()
            .setDescription(`${client.warningEmoji} This conversation does not have access to the full functions of anvil. It is only design to help you get the information Anvil needs in order to perform the operation you requested.`)
            .setColor('#2b2d31')

        this.channel.send({embeds: [embed]})

        // Map to array
        let utils = Array.from(client.openAIOperations.values()).filter(op => op.category === "utilities" || op.name === this.targetOperation.name);
        this.utilFunctions = utils.map(op => op.openaiFunction)
        this.messages.push({role: "system", content: `Anvil now have access to get functions. Be very attentive to what information you need and use theses functions before using the ${this.targetOperation.name} function.`});
    }

    callGPT(client, model) {
        let functions = this.utilFunctions ? this.utilFunctions : [this.targetOperation.openaiFunction];
        return new Promise(async (resolve, reject) => {
            try {
                let chatCompletion = await client.openAIAgent.createChatCompletion({
                    model: model,
                    messages: this.messages,
                    functions: functions,
                    function_call: 'auto',
                    temperature: 0
                });
                resolve(chatCompletion.data.choices[0]);
            } catch (e) {
                this.error(`Error while calling GPT: ${e}`)
                reject(e);
            }
        });
    }

    awaitMessages(client, message) {
        return new Promise(async (resolve, reject) => {
            let filter = m => m.author.id === message.author.id;
            await this.channel.awaitMessages({filter, max: 1, time: 60_000, errors: ['time']})
                .then(async (collected) => {
                    this.messages.push({role: "user", content: collected.first().content});
                    resolve(collected.first().content);
                }).catch(() => {
                    this.parentConversation.updateStatus(`${client.errorEmoji} Timeout error`);
                    reject("Error user did not respond in the 60 second time limit inside the thread")
                })
        })
    }

    async startConversation(client, message) {
        if (this.channel) await this.channel.sendTyping()
        try {
            let response = await this.callGPT(client, "gpt-3.5-turbo");
            if (response.finish_reason === "function_call") {
                if (response.message.function_call.name !== this.targetOperation.name) {
                    let func = client.openAIOperations.get(response.message.function_call.name)
                    await this.parentConversation.updateStatusNoHistory(`${client.loadingEmoji} ${func.messages.waiting}`);
                    this.log(`Triggered function ${func.name} with arguments ${JSON.stringify(response.message.function_call.arguments)}`);
                    let [continue_instruction, result, error] = await func.run(client, message.guild, JSON.parse(response.message.function_call.arguments))
                    if (error) {
                        this.messages.push({role: "function", name: func.name, content: result});
                        await this.parentConversation.updateStatus(`${client.errorEmoji} ${func.messages.error}`);
                        this.error(`Error while executing operation: ${func.name} | ${result}`);
                        return await this.startConversation(client, message);
                    }
                    this.messages.push({role: "function", name: func.name, content: result});
                    await this.parentConversation.updateStatus(`${client.successEmoji} ${func.messages.finish}`);
                    return await this.startConversation(client, message);
                }

                await this.delete();
                await this.parentConversation.updateStatusNoHistory(`${client.loadingEmoji} ${this.targetOperation.messages.waiting}`);

                this.log(`Triggered function ${this.targetOperation.name} with arguments ${JSON.stringify(response.message.function_call.arguments)}`);
                let [continue_instruction, result, error] = await this.targetOperation.run(client, message.guild, JSON.parse(response.message.function_call.arguments));
                if (error) {
                    this.messages.push({role: "function", name: this.targetOperation.name, content: result});
                    await this.parentConversation.updateStatus(`${client.errorEmoji} ${this.targetOperation.messages.error}`);
                    this.warn(`Error while executing operation: ${this.targetOperation.name} | ${result}`);
                    return await this.startConversation(client, message);
                }
                await this.parentConversation.updateStatus(`${client.successEmoji} ${this.targetOperation.messages.finish}`);
                return [continue_instruction, result, error];
            } else {
                await this.parentConversation.updateStatusNoHistory(`${client.loadingEmoji} Waiting for user input in thread...`);
                await this.sendMessage(response.message.content, client);
                let userInput = await this.awaitMessages(client, message);
                if (userInput.startsWith("Error")) {
                    await this.delete()
                    return [true, userInput, true];
                }
                return await this.startConversation(client, message);
            }
        } catch (e) {
            await this.delete()
            this.error(`Error in thread conversation: ${e}`);
            return [true, `Error in thread conversation: ${e}`, true];
        }
    }


    async sendMessage(message, client) {
        if (this.channel === undefined) await this.init("conversation with anvil", "Anvil needs more information to perform this operation", client);
        this.messages.push({role: "assistant", content: message});
        await this.channel.send(message);
    }


    async delete() {
        if (this.channel === undefined) return;
        try {
            await this.channel.delete();
        } catch(e) {
            this.error(`Error while deleting thread: ${e}`);
        }
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