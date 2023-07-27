const BaseFunction = require("../../../utils/structures/BaseFunction");
const { ChannelType } = require("discord.js");

module.exports = class GetAllChannels extends BaseFunction {
    constructor() {
        super('get_all_channels', 'utilities', "Get all channels from a Discord server", {
            waiting: "🔄 Trying to get all channels ...",
            finish: "✅ Server channels fetched",
            error: "❌ Error while getting all channels"
        });
        this.openaiFunction = {
            "name": this.name,
            "description": this.description,
            "parameters": {
                "type": "object",
                "properties": {
                },
                "required": []
            }
        }
    }

    async run(client, message) {
        let serverInfo = {
            categories: [],
            channels_without_category: []
        };

        // Fetching and storing all categories and their respective channels
        message.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory).forEach(category => {
            let categoryInfo = {
                id: category.id,
                name: category.name,
                position: category.position,
                subChannels: []
            };

            message.guild.channels.cache.filter(channel => channel.parentId === category.id).forEach(channel => {
                categoryInfo.subChannels.push({
                    id: channel.id,
                    name: channel.name,
                    type: channel.type,
                    position: channel.position
                });
            });

            serverInfo.categories.push(categoryInfo);
        });

        // Check if there are any channels that are not in a category
        message.guild.channels.cache.filter(channel => channel.type !== ChannelType.GuildCategory && !channel.parent).forEach(channel => {
            serverInfo.channels_without_category.push({
                id: channel.id,
                name: channel.name,
                type: channel.type,
                position: channel.position
            });
        });


        return [true, JSON.stringify(serverInfo), false];
    }
}