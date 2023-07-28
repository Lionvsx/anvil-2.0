const BaseFunction = require('../../../utils/structures/BaseFunction');
const { PermissionFlagsBits } = require('discord.js');

module.exports = class CreateRolesFunction extends BaseFunction {
    constructor() {
        super('create_roles', 'moderation', "Create multiple roles with specific permissions in a Discord server", {
            waiting: "Trying to create roles ...",
            finish: "Roles created",
            error: "Error while creating roles"
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
                                "roleName": {
                                    "type": "string",
                                    "description": "The name of the role should be emoji | name"
                                },
                                "color": {
                                    "type": "string",
                                    "description": "The color of the role in HEX code format. CONVERT TO HEX"
                                },
                                "permissions": {
                                    "type": "array",
                                    "items": {
                                        "type": "string",
                                        "enum": [Object.keys(PermissionFlagsBits).join(', ')],
                                    },
                                    "description": "An array of permissions to be assigned to the role."
                                }
                            },
                            "required": ["roleName", "color", "permissions"]
                        },
                        "description": "An array of objects, each representing a role to be created."
                    },
                },
                "required": ["roles"]
            }
        }
    }

    async run(client, guild, params) {
        let createdRoles = [];

        for(let roleInfo of params.roles) {
            // Check if permissions are valid
            let permissions = [];
            if (!Array.isArray(roleInfo.permissions)) {
                return [true, `Permissions must be an array of permission strings`, true];
            }
            for(let permission of roleInfo.permissions) {
                if(!PermissionFlagsBits[permission]) {
                    return [true, `Invalid permission: ${permission}`, true];
                }
                permissions.push(PermissionFlagsBits[permission]);
            }

            // Check the format of the color

            try {
                let role = await guild.roles.create({
                    name: roleInfo.roleName,
                    color: roleInfo.color,
                    permissions: permissions
                });
                createdRoles.push(`Role created: ${role.name}, color: ${role.color.hexColor}, permissions: ${permissions.join(", ")}`);

            } catch (error) {
                return [true, `Error creating role: ${error.message}`, true];
            }

        }

        return [true, createdRoles.join("\n"), false];
    }
}
