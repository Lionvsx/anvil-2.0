const BaseFunction = require("../../../utils/structures/BaseFunction");

module.exports = class EditRoles extends BaseFunction {
    constructor() {
        super("edit_roles", "role", "Edit role name, and permissions on a discord server", {
            waiting: "Trying to edit roles...",
            finish: "Edited roles",
            error: "Error while editing roles"
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
                            "type": "object",
                            "properties": {
                                "role": {
                                    "type": "string",
                                    "description": "The id or name of the role to be edited."
                                },
                                "permissions": {
                                    "type": "array",
                                    "items": {
                                        "type": "string",
                                        "description": "The permissions to be added to the role."
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    async run(client, guild, params) {
        let editedRoles = [];
        for(let roleInfo of params.roles) {
            let role = guild.roles.cache.find(r => r.name === roleInfo.role || r.id === roleInfo.role);
            if(!role) {
                return [true, `Role "${roleInfo.role}" not found.`, true];
            }

            let permissions = [];
            for(let permission of roleInfo.permissions) {
                if(!role.permissions.has(permission)) {
                    permissions.push(permission);
                }
            }

            if(permissions.length > 0) {
                await role.edit({
                    permissions: permissions
                });
            }

            editedRoles.push(role.name);
        }

        return [true, `Edited roles successfully : ${editedRoles.join(", ")}`, false];
    }
}