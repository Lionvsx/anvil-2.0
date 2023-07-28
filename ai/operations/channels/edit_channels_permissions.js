const BaseFunction = require('../../../utils/structures/BaseFunction');
const { ChannelType } = require('discord.js');
const {getRole, getUser, getChannel} = require("../../../functions/get_functions");

module.exports = class EditChannelPermissionsFunction extends BaseFunction {
    constructor() {
        super('edit_channel_permissions', 'moderation', "Only use this to change permissions of one or more discord channels", {
            waiting: "Trying to edit channel permissions...",
            finish: "Channel permissions edited",
            error: "Error while editing channel permissions"
        });
        this.openaiFunction = {
            "name": this.name,
            "description": this.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "channels": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "channel": {
                                    "type": "string",
                                    "description": "The name or ID of the channel whose permissions are to be edited."
                                },
                                "permissionsArray": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "target": {
                                                "type": "string",
                                                "description": "The name or ID of a role or user"
                                            },
                                            "targetPermissions": {
                                                "type": "object",
                                                "properties": {
                                                    "ViewChannel": {
                                                        "type": "string",
                                                        "enum": ["allow", "deny", "neutral"],
                                                        "description": "If the role or user can view the channel"
                                                    },
                                                    "SendMessages": {
                                                        "type": "string",
                                                        "enum": ["allow", "deny", "neutral"],
                                                        "description": "If the role or user can send messages in the channel"
                                                    },
                                                    "Connect": {
                                                        "type": "string",
                                                        "enum": ["allow", "deny", "neutral"],
                                                        "description": "If the role or user can connect to a voice channel"
                                                    },
                                                    "ReadMessageHistory": {
                                                        "type": "string",
                                                        "enum": ["allow", "deny", "neutral"],
                                                        "description": "If the role or user can read the message history of the channel"
                                                    }
                                                },
                                                "required": ["ViewChannel", "SendMessages", "Connect", "ReadMessageHistory"],
                                                "description": "The permissions to be set for the specified role or user."
                                            }
                                        },
                                        "required": ["target", "permissions"],
                                    }
                                }
                            },
                            "required": ["channel", "permissions"],
                            "description": "An object representing a channel whose permissions are to be edited."
                        },
                        "description": "An array of objects, each representing a channel whose permissions are to be edited."
                    }
                },
                "required": ["channels"]
            }
        }
    }

    async run(client, guild, params) {
        let editedChannels = [];
        for(let channelInfo of params.channels) {
            let channel = getChannel(channelInfo.channel, guild)
            if(!channel) {
                return [true, `Channel "${channelInfo.channel}" not found, fall-back to function get_all_channels`, true];
            }

            //If target channel is category, sync all channels in category
            if(channel.type === ChannelType.GuildCategory) {
                for (const [key, subChannel] of channel.children.cache) {
                    subChannel.lockPermissions();
                }
            }

            if(channelInfo.permissionsArray) {
                if (!Array.isArray(channelInfo.permissionsArray)) channelInfo.permissionsArray = [channelInfo.permissions];
                for(let permissionObject of channelInfo.permissionsArray) {
                    let permTarget = getRole(permissionObject.target, guild) || getUser(permissionObject.target, guild);
                    if(!permTarget) {
                        return [true, `Role or user "${permissionObject.target}" not found. fall back to get_all_roles`, true];
                    }

                    let permOptions = {};
                    Object.keys(permissionObject.targetPermissions).forEach(perm => {
                        switch(permissionObject.targetPermissions[perm]) {
                            case 'allow':
                                permOptions[perm] = true;
                                break;
                            case 'deny':
                                permOptions[perm] = false;
                                break;
                            case 'neutral':
                                permOptions[perm] = null;
                                break;
                        }
                    });

                    channel.permissionOverwrites.edit(permTarget, permOptions);
                }

                editedChannels.push(`${channel.name} with permissions: ${JSON.stringify(channelInfo.permissionsArray)}`);
            } else {
                return [true, `No permissions provided for channel "${channelInfo.channel}"`, true];
            }
        }

        return [true, `Permissions edited for channels : ${editedChannels.join('\n')}`, false];
    }

}
