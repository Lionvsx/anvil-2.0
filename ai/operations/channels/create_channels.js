const BaseFunction = require('../../../utils/structures/BaseFunction');
const { ChannelType } = require("discord.js");

module.exports = class CreateChannelsFunction extends BaseFunction {
    constructor() {
        super('create_channels', 'moderation', "Create one or more channels in a Discord server", {
            waiting: "Trying to create channels ...",
            finish: "Created channels",
            error: "Error while creating channels"
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
                                "channelName": {
                                    "type": "string",
                                    "description": "The name of the channel"
                                },
                                "channelType": {
                                    "type": "string",
                                    "enum": ["GuildText", "GuildVoice", "GuildCategory"],
                                    "description": "The type of the channel"
                                },
                                "parentCategory": {
                                    "type": "string",
                                    "description": "The EXACT ID or name of the parent category. If a name is provided, the first category with this name will be used"
                                },
                            },
                            "required": ["channelName", "channelType"]
                        },
                        "description": "An array of objects, each representing a channel to be created."
                    },
                },
                "required": ["channels"]
            }
        }

    }

    async run(client, guild, params) {
        // Initialising an array to keep track of created channels.
        let createdChannels = [];

        // Iterating over the channels array from params.
        for(let channelInfo of params.channels) {
            // Check if a parent category is defined.
            let parentCategoryID = null;
            if(channelInfo.parentCategory) {
                let parentCategory = guild.channels.cache.find(
                    ch => ch.name === channelInfo.parentCategory || ch.id === channelInfo.parentCategory
                );

                // Check if the parent category was found.
                if(parentCategory) {
                    parentCategoryID = parentCategory.id;
                }
                else {
                    return [true, `Parent category "${channelInfo.parentCategory}" not found.`, true];
                }
            }

            // Create a channel with the provided name and type.
            let channel = await guild.channels.create({
                name: channelInfo.channelName,
                type: ChannelType[channelInfo.channelType],
                parent: parentCategoryID,
            });

            // Add the created channel's information to the array.
            createdChannels.push(`Channel created: ${channel.name}, type: ${ChannelType[channelInfo.channelType]}, id: ${channel.id}`);
        }

        // Concatenate all the channel information into one string.
        let result = createdChannels.join("\n");

        // Return the result.
        return [true, result, false];
    }
}
