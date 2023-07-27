const BaseFunction = require('../../../utils/structures/BaseFunction');
const {getUsers} = require("../../../functions/get_functions");

module.exports = class GetUsersFunction extends BaseFunction {
    constructor() {
        super("get_users", "utilities", "Get one or more users from a Discord server", {
            waiting: "🔄 Trying to get users ...",
            finish: "✅ User fetched",
            error: "❌ Error while getting users"
        });
        this.openaiFunction = {
            "name": this.name,
            "description": this.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "users": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "description": "The EXACT ID or name (without @) of the user to be retrieved. If a name is provided, the first user with this name will be used"
                        }
                    }
                }
            },
            "required": ["users"]
        }
    }

    async run(client, message, params) {
        let [foundUsers, notFoundUsers] = getUsers(params.users, message.guild);
        if (notFoundUsers.length > 0) {
            return [true, `Users not found: ${notFoundUsers.join(", ")}`];
        }

        let users = foundUsers.map(u => {
            return {
                id: u.id,
                name: u.user.username,
                display: u.displayName,
                roles: u.roles.cache.map(role => role.name)
            }
        });

        console.log(users)

        return [true, `Found users: ${JSON.stringify(users)}`, false];
    }
}