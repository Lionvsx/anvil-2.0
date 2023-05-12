const BaseEvent = require('../../utils/structures/BaseEvent')
const Guild = require('../../src/schemas/GuildSchema')

module.exports = class guildCreateEvent extends BaseEvent {
    constructor() {
        super('guildCreate')
    }

    async run(client, guild) {
        await Guild.create({
            guildId: guild.id,
            guildName: guild.name
        }, async (err) => {
            if (err) throw err && client.log(`There was an error trying to save GUILD : ${guild.name} to the database !`)
            else client.log(`Bot ${client.user.username} joined GUILD : ${guild.name} !`)
        })
        try {
            await client.application.commands.set(client.slashCommands, guild.id)
            this.log(`Loaded ${client.slashCommands.length} (/) commands for guild ${guild.name}`)
        } catch (err) {
            this.error(`Failed setting application commands`, err)
        }
    }
}