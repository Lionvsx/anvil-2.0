const BaseFunction = require('../../../utils/structures/BaseFunction');

module.exports = class FeatureSetup extends BaseFunction {
    constructor() {
        super("feature_setup", "setup", "Setup a feature within the features available with the bot", {
            waiting: "🔄 Trying to setup feature...",
            finish: "✅ Feature setup",
            error: "❌ Error while setting up feature"
        });

        this.openaiFunction = {
            "name": this.name,
            "description": this.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "feature": {
                        "type": "string",
                        "enum": ["autochannels", "ticketing"],
                    },
                    "instructions": {
                        "type": "string",
                        "description": "Instructions for the AI to setup the feature. Be as specific as possible and provide STEPS."
                    }
                },
                "required": ["feature", "instructions"]
            }
        }
    }

    async run(client, message, params) {
        console.log(params)
        return [false, "Not implemented yet", false];
    }
}