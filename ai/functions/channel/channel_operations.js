const BaseFunction = require("../../../utils/structures/BaseFunction");
const ThreadConversation = require("../../../utils/structures/ThreadConversation");

module.exports = class ChannelOperations extends BaseFunction {
    constructor() {
        super('channel_operations', 'moderation', "Create, edit, delete or rename one or more channels in a Discord server", {
            waiting: "🔄 Trying to perform channel operations...",
            finish: "✅ Channel operations performed",
            error: "❌ Error while performing channel operations"
        });
        this.openaiFunction = {
            "name": this.name,
            "description": this.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "operation": {
                        "type": "string",
                        "enum": ["create_channels", "edit_channel_permissions", "delete_channels", "rename_channels", "create_categories_with_subchannels", "list_all_channels"],
                    }
                },
                "required": ["operation"]
            }
        }

    }

    async run(client, message, params) {
        let operation = client.openAIOperations.get(params.operation);
        let allChannelsOperation = client.openAIOperations.get("get_all_channels");
        let allChannelData = await allChannelsOperation.run(client, message);
        let thread = new ThreadConversation(message.channel, operation, [
            {role: "system", content: "You are Anvil, a bot on Discord. Your primary function is to utilize predefined functions to interact with users and assist with their needs on Discord. You should not make assumptions about function parameters, and instead, ask the user for further clarification if needed. Always communicate politely and use markdown for better readability when appropriate. Be very attentive to function outputs when answering to users."},
            {role: "system", content: `All the data about the channels in this server: ${allChannelData[1]}`},
            {role: "user", content: `My name is ${message.author.username} and I am from ${message.guild.name} server. Use this information when I refer to myself in the future.`},
            {role: "user", content: message.content}
        ]);

        return await thread.startConversation(client, message);
    }
}