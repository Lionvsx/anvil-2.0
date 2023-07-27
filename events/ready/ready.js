const BaseEvent = require('../../utils/structures/BaseEvent');
const Guild = require('../../src/schemas/GuildSchema')
const { showCommandLoad } = require('../../utils/register')
const { ActivityType } = require('discord.js');

module.exports = class ReadyEvent extends BaseEvent {
    constructor() {
        super('ready')
    }

    async run(client) {
        client.user.setActivity('By Lionvsx', { type: ActivityType.Watching });
        console.log(`Bot ${client.user.username} loaded and ready !`)
        await showCommandLoad()

        const commands = []
        for (const [name, command] of client.commands) {
            commands.push(command.builder.toJSON())
        }

        for (const [key, value] of client.guilds.cache) {
            const guildConfig = await Guild.findOne({ guildId: key });
            if (guildConfig) {
                client.config.set(key, guildConfig)
                client.log(`Loaded config data for guild : ${value.name}`)
            } else {
                await Guild.create({
                    guildId: key,
                    guildName: value.name
                }).catch(err => {
                    if (err) throw err && client.log(`There was an error trying to save GUILD : ${value.name} to the database !`)
                    else client.error(`⚠️ Guild : ${value.name} wasn't saved in the database, created new entry ! ⚠️`)
                })
            }
        }


        for (const [key, value] of client.openAIFunctions) {
            client.functionsArray.push(value.openaiFunction)
        }
    }
}