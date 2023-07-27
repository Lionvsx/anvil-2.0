const BaseFunction = require("../../../utils/structures/BaseFunction");
const ThreadConversation = require("../../../utils/structures/ThreadConversation");

module.exports = class RoleOperations extends BaseFunction {
    constructor() {
        super("role_operations", "role", "Create, delete, edit or list roles on a discord server.", {
            waiting: "🔄 Trying to perform role operations...",
            finish: "✅ Role operations performed",
            error: "❌ Error while performing role operations"
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
                    }
                },
                "required": ["operation"]
            }
        }
    }

    async run(client, message, params) {
        let operation = client.openAIOperations.get(params.operation);
        let thread = new ThreadConversation(message.channel, operation, [
            {role: "system", content: operation.systemPrompt},
            {role: "user", content: `My name is ${message.author.username} and I am from ${message.guild.name} server. Use this information when I refer to myself in the future.`},
            {role: "user", content: message.content}
        ]);

        return await thread.startConversation(client, message);
    }
}