const BaseFunction = require("../../../utils/structures/BaseFunction");

module.exports = class ServerSetupOperation extends BaseFunction {
    constructor() {
        super("server_setup", "setup", "Full setup of server roles and channels", {
            waiting: "🔄 Trying to setup server...",
            finish: "✅ Server setup",
            error: "❌ Error while setting up server"
        });

        this.openaiFunction = {
            "name": this.name,
            "description": this.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "instructions": {
                        "type": "string",
                        "description": "Instructions for the AI to setup the server"
                    }
                },
                "required": ["instructions"]
            }
        }
    }

    async run(client, message, params) {
        console.log(params)
        return [false, "Not implemented yet", false];
    }
}