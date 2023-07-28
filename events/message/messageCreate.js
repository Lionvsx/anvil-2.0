const BaseEvent = require('../../utils/structures/BaseEvent')
const {ChannelType} = require("discord.js");
const Conversation = require("../../utils/structures/Conversation");
module.exports = class MessageCreate extends BaseEvent {
    constructor() {
        super('messageCreate');
    }

    async run(client, message) {
        // Check if message is from a bot
        if (message.author.bot) return;
        // Check if message is in a guild
        if (!message.guild) return;
        // Check if message is in a thread
        if(message.channel.type === ChannelType.GuildPrivateThread) return;

        // Check if message tags the bot
        if (message.mentions.has(client.user.id)) {
            message.content = message.content.replace(`<@${client.user.id}>`, "").trim();
            if (!client.conversations[message.channel.id]) client.conversations[message.channel.id] = new Conversation(message)
            await client.conversations[message.channel.id].userInput(client, message);
        }
    }
}