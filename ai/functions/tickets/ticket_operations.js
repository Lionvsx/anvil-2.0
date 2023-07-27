const BaseFunction = require("../../../utils/structures/BaseFunction");

module.exports = class TicketOperations extends BaseFunction {
    constructor() {
        super('ticket_operations', 'ticket', "Operations on tickets", {
            waiting: "🔄 Trying to perform ticket operations ...",
            finish: "✅ Ticket operations performed",
            error: "❌ Error while performing ticket operations"
        });

        this.openaiFunction = {
            "name": this.name,
            "description": this.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "operation": {
                        "type": "string",
                        "enum": ["create", "delete", "edit", "list_all_tickets"],
                    }
                }
            }
        }
    }

    async run(client, message, params) {

    }
}