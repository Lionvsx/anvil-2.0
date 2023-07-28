const BaseFunction = require('../../../utils/structures/BaseFunction');
const { ChannelType, PermissionFlagsBits } = require("discord.js");

module.exports = class CreateCategoriesWithSubChannels extends BaseFunction {
    constructor() {
        super('create_categories_with_subchannels', 'moderation', "You might need to create roles for this." +
            "Create one or multiple channels and categories. Channel names should follow the format 'emoji┃name'. Category names should follow the format '──────emoji name emoji──────'." +
            "Basic channel permissions are that for staff channels, only staff should see, for annoucement, only staff should write but everyone can see", {
            waiting: "Trying to create categories and channels ...",
            finish: "Created categories and channels",
            error: "Error while creating categories and channels"
        });
        this.openaiFunction = {
            "name": this.name,
            "description": this.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "categoriesWithSubchannels": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "categoryName": {
                                    "type": "string",
                                    "description": "The name of the category. Category names should follow the format '──────emoji name emoji──────'. This can also be the name of AN EXISTING CATEGORY"
                                },
                                "subchannels": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "channelName": {
                                                "type": "string"
                                            },
                                            "channelType": {
                                                "type": "string",
                                                "enum": ["GuildText", "GuildVoice"],
                                            },
                                        },
                                        "required": ["channelName", "channelType"]
                                    }
                                }
                            },
                            "required": ["categoryName", "subchannels"]
                        },
                        "description": "An array of category and subchannel objects. Channel names should include an emoji and follow the format 'emoji┃name'. Category names should follow the format '──────emoji name emoji──────'."
                    }
                },
                "required": ["categoriesWithSubchannels"]
            }
        }

    }

    async run(client, guild, params) {
        console.log(params)
        let results = [];


        for (let categoryObject of params.categoriesWithSubchannels) {
            // Check if the category already exists
            let category = guild.channels.cache.find(c => c.name.toLowerCase().includes(categoryObject.categoryName.toLowerCase()) && c.type === ChannelType.GuildCategory);
            if (!category) {
                category = await guild.channels.create({
                    name: categoryObject.categoryName,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        }
                    ]
                });
            }
            results.push(`Category created: ${category.name}`);

            for (let subchannelObject of categoryObject.subchannels) {

                let subchannel = await guild.channels.create({
                    name: subchannelObject.channelName,
                    type: ChannelType[subchannelObject.channelType],
                    parent: category,
                });
                results.push(`Subchannel created: ${subchannel.name}, in category: ${category.name}`);
            }
        }

        return [true, results.join('\n'), false];
    }
}
