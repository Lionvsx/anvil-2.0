const Logger = require("../services/Logger");
module.exports = class Conversation {
    constructor(message, channel) {
        this.messages = [
            {role: "system", content: "You are Anvil, a bot on Discord. Your primary function is to utilize predefined functions to interact with users and assist with their needs on Discord. You should not make assumptions about function parameters, and instead, ask the user for further clarification if needed. Always communicate politely and use markdown for better readability when appropriate. Be very attentive to function outputs when answering to users. When answering refer to function output in order to inform the user of what you did in the server."},
            {role: "user", content: `My name is ${message.author.username} and I am from ${message.guild.name} server. Use this information when I refer to myself in the future.`},
            {role: "user", content: message.content}
        ];
        this.consoleLogger = new Logger("ai_conversation");
        this.statusHistory = [];
        this.statusMsg = undefined;
        this.channel = channel;
    }


    callGPT(client, model) {
        return new Promise(async (resolve, reject) => {
            try {
                let chatCompletion = await client.openAIAgent.createChatCompletion({
                    model: model,
                    messages: this.messages,
                    functions: [client.functionsArray],
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
            message.statusMsg = await message.channel.send("```🔄 Bot is thinking ...```")
            let statusHistory = []

            let response = await this.callGPT(client, "gpt-3.5-turbo");
            let func = client.openAIFunctions.get(response.message.function_call.name)

            if (response.finish_reason === "function_call") {
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
            this.updateStatus("❌ Error while starting conversation")
            return [true, `Error while starting conversation: ${e}`, true];
        }
    }



    async sendMessage(message) {
        this.messages.push({role: "assistant", content: message});
        if (message.length > 2000) {
            let messages = message.match(/(.|[\r\n]){1,2000}/g)
            for (let i = 0; i < messages.length; i++) {
                await this.channel.send(messages[i])
            }
        } else {
            await this.channel.send(message)
        }
    }

    async userInput(client, message) {
        this.statusMsg = await message.channel.send("```🔄 Bot is thinking ...```")
        this.messages.push({role: "user", content: message});
        let response = await this.callGPT(client, "gpt-3.5-turbo");


        if (response.finish_reason === "function_call") {
            let func = client.openAIFunctions.get(response.message.function_call.name)
            this.log(`Triggered function ${func.name} with arguments ${JSON.stringify(response.message.function_call.arguments)}`)
            let [continue_instruction, result, error] = await func.run(client, message, JSON.parse(response.message.function_call.arguments))
            if (result) {
                this.messages.push({role: "function", name: func.name, content: result})
            }
            if (error) {
                await this.updateStatus(message, func.messages.error)
            } else {
                await this.updateStatus(message, func.messages.finish)
            }
            if (!continue_instruction) {
                return [true, "Conversation finished", false];
            }
        } else {
            if (this.statusHistory.length === 0) {
                message.statusMsg.delete()
            }
            await this.sendMessage(response.message.content)
        }
    }

    async iterate(client, message) {

    }

    async updateStatus(status) {
        this.statusHistory.push(status);
        await this.statusMsg.edit(`\`\`\`${this.statusHistory.join('\n')}\`\`\``);
    }

    tryFunctionRun(client, message, func, params) {

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