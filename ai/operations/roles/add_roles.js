const BaseFunction = require('../../../utils/structures/BaseFunction');
const { getRoles, getUsers } = require("../../../functions/get_functions");

module.exports = class AddRolesFunction extends BaseFunction {
    constructor() {
        super('add_roles', 'moderation', "Add one or more roles to one or more users", {
            waiting: "Trying to add roles ...",
            finish: "Roles added",
            error: "Error while adding roles"
        });
        this.openaiFunction = {
            "name": this.name,
            "description": this.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "users": {
                        "type": "array",
                        "items": { "type": "string" },
                        "description": "An array of user names or IDs"
                    },
                    "roles": {
                        "type": "array",
                        "items": { "type": "string" },
                        "description": "An array of role names or IDs to be added to the users"
                    },
                },
                "required": ["users", "roles"]
            }
        }
    }

    async run(client, guild, params) {
        let [foundUsers, userErrors] = getUsers(params.users, guild);
        if (userErrors.length > 0) {
            return [true, userErrors.join("\n"), true];
        }

        let [foundRoles, roleErrors] = getRoles(params.roles, guild);
        if (roleErrors.length > 0) {
            return [true, roleErrors.join("\n"), true];
        }

        let changes = [];
        for (let user of foundUsers) {
            let addedRoles = [];
            for (let role of foundRoles) {
                await user.roles.add(role);
                addedRoles.push(role.name);
            }
            changes.push(`Added roles: ${addedRoles.join(", ")} | to user: ${user.user.username}`);
        }

        return [true, "role_operations was successful : " + changes.join("\n"), false];
    }
}
