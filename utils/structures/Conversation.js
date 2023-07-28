const Logger = require("../services/Logger");
const {EmbedBuilder} = require("discord.js");
module.exports = class Conversation {
    constructor(message) {
        this.messages = [
            {role: "system", content: "You are Anvil, a bot on Discord. Your primary function is to utilize predefined functions to interact with users and assist with their needs on Discord. You should not make assumptions about function parameters, and instead, ask the user for further clarification if needed. Always communicate politely and use markdown for better readability when appropriate. Be very attentive to function outputs when answering to users. When answering refer to function output in order to inform the user of what you did in the server."},
            {role: "user", content: `My name is ${message.author.username} and I am from ${message.guild.name} server. Use this information when I refer to myself in the future.`},
            {role: "user", content: message.content}
        ];
        this.consoleLogger = new Logger("ai_conversation");
        this.statusHistory = [];
        this.statusMsg = undefined;
        this.channel = message.channel;
    }


    callGPT(client, model) {
        return new Promise(async (resolve, reject) => {
            try {
                let chatCompletion = await client.openAIAgent.createChatCompletion({
                    model: model,
                    messages: this.messages,
                    functions: client.functionsArray,
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

    callGPTNoFunctions(client, model) {
        return new Promise(async (resolve, reject) => {
            try {
                let chatCompletion = await client.openAIAgent.createChatCompletion({
                    model: model,
                    messages: this.messages,
                });
                resolve(chatCompletion.data.choices[0]);
            } catch (e) {
                this.error(`Error while calling GPT: ${e}`);
                reject(e);
            }
        });
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

    clearStatusHistory () {
        this.statusHistory = [];
    }

    async userInput(client, message) {
        this.clearStatusHistory();
        let statusEmbed = new EmbedBuilder()
            .setDescription(`${client.loadingEmoji} Bot is thinking ...`)
            .setColor("#2b2d31")
        this.statusMsg = await message.channel.send({
            embeds: [statusEmbed]
        });
        this.messages.push({role: "user", content: message.content});
        let response = await this.callGPT(client, "gpt-3.5-turbo");


        if (response.finish_reason === "function_call") {
            let func = client.openAIFunctions.get(response.message.function_call.name)
            if (!func) {
                await this.updateStatus(`${client.errorEmoji} Function ${response.message.function_call.name} not found`)
                this.messages.push({role: "assistant", content: `Function ${response.message.function_call.name} does not exist. Be very careful and only use existing functions !`})
                let response = await this.callGPTNoFunctions(client, "gpt-3.5-turbo");
                await this.sendMessage(response.message.content)
                return;
            }
            this.log(`Triggered function ${func.name} with arguments ${JSON.stringify(response.message.function_call.arguments)}`)
            let [continue_instruction, result, error] = await func.run(client, message, JSON.parse(response.message.function_call.arguments))
            if (result) {
                this.messages.push({role: "function", name: func.name, content: result})
            }
            if (error) {
                this.warn(`Error while running function ${func.name}, invalid arguments`)
                await this.updateStatus(`${client.errorEmoji} ${func.messages.error}`)
            } else {
                await this.updateStatus(`${client.successEmoji} ${func.messages.finish}`)
            }

            response = await this.callGPTNoFunctions(client, "gpt-3.5-turbo");
            await this.sendMessage(response.message.content)
        } else {
            if (this.statusHistory.length === 0) {
                this.statusMsg.delete()
            }
            await this.sendMessage(response.message.content)
        }
    }

    async updateStatus(status) {
        this.statusHistory.push(status);
        let embed = new EmbedBuilder()
            .setDescription(`${this.statusHistory.join('\n')}`)
            .setColor("#2b2d31")
        await this.statusMsg.edit({
            embeds: [embed]
        })
    }

    async updateStatusNoHistory(status) {
        let embed = new EmbedBuilder()
            .setDescription(`${this.statusHistory.join('\n')}\n${status}`)
            .setColor("#2b2d31")
        await this.statusMsg.edit({
            embeds: [embed]
        })
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