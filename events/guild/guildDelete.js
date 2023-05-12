const BaseEvent = require('../../utils/structures/BaseEvent')
const Guild = require('../../src/schemas/GuildSchema')

module.exports = class guildDeleteEvent extends BaseEvent {
    constructor() {
        super('guildDelete')
    }

    async run(client, guild) {
        const DBGuild = await Guild.findOne({ guildId: guild.id });
        if (!DBGuild) return client.error(`Leaving a guild not stored in Database !`);
        else {
            await Guild.deleteOne({guildId: guild.id}, async (err) => {
                if (err) throw err;
                else client.log(`Bot ${client.user.username} left GUILD : ${guild.name} !`);
            });
        }
    }
}