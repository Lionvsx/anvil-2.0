const BaseFunction = require("../../../utils/structures/BaseFunction");
const ThreadConversation = require("../../../utils/structures/ThreadConversation");

module.exports = class ChannelOperations extends BaseFunction {
    constructor() {
        super('channel_operations', 'moderation', "Create, edit, delete or rename one or more channels in a Discord server Use this when user asks for specific access on channels and edit channel permissions for roles", {
            waiting: "Trying to perform channel operations...",
            finish: "Channel operations performed",
            error: "Error while performing channel operations"
        });
        this.openaiFunction = {
            "name": this.name,
            "description": this.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "operation": {
                        "type": "string",
                        "enum": ["create_channels", "edit_channel_permissions", "delete_channels", "rename_channels", "create_categories_with_subchannels", "get_all_channels"],
                    },
                    "required_data": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "enum": ["get_all_channels", "get_all_roles"]
                        }
                    }
                },
                "required": ["operation", "required_data"]
            }
        }

    }

    async run(client, message, params) {
        let operation = client.openAIOperations.get(params.operation)
        let conversation = client.conversations[message.channel.id];

        if (!Array.isArray(params.required_data)) params.required_data = [params.required_data];
        for (let dataFunctionName of params.required_data) {
           let dataFunction = client.openAIOperations.get(dataFunctionName);
           let data = await dataFunction.run(client, message.guild);
           conversation.messages.push({role: "system", content: data[1]})
        }

        let thread = new ThreadConversation(message.channel, operation, conversation);

        return await thread.startConversation(client, message);
    }
}