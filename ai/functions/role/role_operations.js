const BaseFunction = require("../../../utils/structures/BaseFunction");
const ThreadConversation = require("../../../utils/structures/ThreadConversation");

module.exports = class RoleOperations extends BaseFunction {
    constructor() {
        super("role_operations", "role", "Create, delete, edit name and global permissions of roles on a discord server. Mind the difference between adding / removing roles to and from users and creating roles on the server", {
            waiting: "Trying to perform role operations...",
            finish: "Role operations performed",
            error: "Error while performing role operations"
        });

        this.openaiFunction = {
            "name": this.name,
            "description": this.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "operation": {
                        "type": "string",
                        "enum": ["create_roles", "delete_roles", "edit_roles", "get_all_roles", "add_roles", "remove_roles"],
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