const BaseFunction = require("../../../utils/structures/BaseFunction");
const { ChannelType } = require("discord.js");

module.exports = class GetAllRoles extends BaseFunction {
    constructor() {
        super('get_all_roles', 'utilities', "Get all roles from a Discord server", {
            waiting: "🔄 Trying to get all roles ...",
            finish: "✅ Server roles fetched",
            error: "❌ Error while getting all roles"
        });
        this.openaiFunction = {
            "name": this.name,
            "description": this.description,
            "parameters": {
                "type": "object",
                "properties": {
                },
                "required": []
            }
        }
    }

    async run(client, message) {
        let serverInfo = {
            roles: [],
            permissions: []
        };

        // Fetching and storing all roles and their permissions
        message.guild.roles.cache.forEach(role => {
            if (!role.editable) return;
            serverInfo.roles.push({
                id: role.id,
                name: role.name,
                color: role.color,
                position: role.position,
                hoist: role.hoist,
                mentionable: role.mentionable,
                permissions: role.permissions.Flags,
            });
        });

        return [true, JSON.stringify(serverInfo), false];
    }
}