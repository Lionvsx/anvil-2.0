const BaseFunction = require('../../../utils/structures/BaseFunction');
const {getRoles, getUser} = require("../../../functions/get_functions");

module.exports = class RemoveRolesFunction extends BaseFunction {
    constructor() {
        super('remove_roles', 'moderation', "Remove one or more roles from a user", {
            waiting: "Trying to remove roles ...",
            finish: "Roles removed",
            error: "Error while removing roles"
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
                        "description": "An array of user IDs or names"
                    },
                    "roles": {
                        "type": "array",
                        "items": { "type": "string" },
                        "description": "An array of role names or IDs to be removed from the user, Can't be empty"
                    },
                },
                "required": ["users", "roles"]
            }
        }

    }

    async run(client, guild, params) {
        let users = [];
        let result = [];
        for (let userID of params.users) {
            let user = getUser(userID, guild);
            if (user) {
                users.push(user);
            } else return [true, `User with ID or name: ${userID} not found.`, true];
        }

        let [foundRoles, notFoundRoles] = getRoles(params.roles, guild);
        if (notFoundRoles.length > 0) {
            return [true, `Roles with IDs or names: ${notFoundRoles.join(", ")} not found.`];
        }
        for (let user of users) {
            let rolesToRemove = guild.roles.cache.filter(r => foundRoles.includes(r) && user.roles.cache.has(r.id));
            // Check roles that are in the foundRoles but not in the user's roles
            if (rolesToRemove.size !== foundRoles.length) {
                let notFoundRoles = foundRoles.filter(r => !rolesToRemove.has(r.id));
                result.push(`User ${user.user.username} doesn't the following roles: ${notFoundRoles.map(r => r.name).join(", ")}. No need to remove them.`);
            }
            if (rolesToRemove.size > 0) {
                await user.roles.remove(rolesToRemove);
                result.push(`Removed roles successfully: ${rolesToRemove.map(r => r.name).join(", ")} from user: ${user.user.username}`);
            }
        }

        return [true, result.join('\n'), false];
    }
}
