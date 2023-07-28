const BaseFunction = require('../../../utils/structures/BaseFunction');
const { BaseChannel } = require('discord.js');
const {getChannel} = require("../../../functions/get_functions");

module.exports = class DeleteChannelsFunction extends BaseFunction {
    constructor() {
        super('delete_channels', 'moderation', "Delete one or more channels in a Discord server. Always use get_all_channels first", {
            waiting: "Trying to delete channels ...",
            finish: "Deleted channels",
            error: "Error while deleting channels"
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
                            "type": "string",
                            "description": "The id or name of the channel to be deleted."
                        },
                        "description": "An array of channel IDs or names to be deleted."
                    },
                },
                "required": ["channels"]
            }
        }

    }

    async run(client, guild, params) {
        let deletedChannels = [];
        for(let channelInfo of params.channels) {
            let channel = getChannel(channelInfo, guild)
            if(channel instanceof BaseChannel) {
                deletedChannels.push(channel.name);
                await channel.delete();
            } else {
                return [true, `Channel "${channelInfo}" not found. and deleted channels: ${deletedChannels.join(", ")}\nfall-back to function get_all_channels`, true];
            }
        }

        return [true, `Deleted channels: ${params.channels.join(", ")}`, false];
    }
}
