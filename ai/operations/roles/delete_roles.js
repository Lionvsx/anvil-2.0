const BaseFunction = require("../../../utils/structures/BaseFunction");
const {getRole} = require("../../../functions/get_functions");
const {Role} = require("discord.js");

module.exports = class DeleteRoles extends BaseFunction {
    constructor() {
        super("delete_roles", "role", "Delete roles from a Discord server", {
            waiting: "Trying to delete roles...",
            finish: "Deleted roles",
            error: "Error while deleting roles"
        });

        this.openaiFunction = {
            "name": this.name,
            "description": this.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "roles": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "description": "The id or name of the role to be deleted."
                        }
                    }
                }
            }
        }

    }

    async run(client, guild, params) {
        let deletedRoles = [];
        for(let roleInfo of params.roles) {
            let role = getRole(roleInfo, guild)
            if(role instanceof Role) {
                deletedRoles.push(role.name);
                await role.delete();
            } else {
                return [true, `Role "${roleInfo}" not found. and deleted roles: ${deletedRoles.join(", ")}\n`, true];
            }
        }

        return [true, `Deleted roles: ${params.roles.join(", ")}`, false];
    }
}