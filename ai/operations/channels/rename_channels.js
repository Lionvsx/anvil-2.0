const BaseFunction = require('../../../utils/structures/BaseFunction');
const {getChannel} = require("../../../functions/get_functions");

module.exports = class RenameChannelFunction extends BaseFunction {
    constructor() {
        super('rename_channels', 'moderation', "Rename, change the name of one or more channels in a discord server", {
            waiting: "Trying to rename channels ...",
            finish: "Channels renamed",
            error: "Error while renaming channels"
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
                                    "description": "The ID or name of the channel to be renamed."
                                },
                                "newName": {
                                    "type": "string",
                                    "description": "The new name of the channel."
                                }
                            },
                            "required": ["channel", "newName"]
                        },
                        "description": "An array of objects, each representing a channel to be renamed."
                    },
                },
                "required": ["channels"]
            }
        }
    }

    async run(client, guild, params) {
        let renamedChannels = [];
        for(let channelInfo of params.channels) {
            let channel = getChannel(channelInfo.channel, guild)
            if(!channel) {
                return [true, `Channel "${channelInfo.channel}" not found, fall-back to function get_all_channels to get a list of all channels in this server.`, true];
            }

            let newChannel = await channel.edit({
                name: channelInfo.newName
            });

            renamedChannels.push(newChannel.name);
        }

        return [true, `Channels renamed with success: ${renamedChannels.join(", ")}`, false];
    }
}
