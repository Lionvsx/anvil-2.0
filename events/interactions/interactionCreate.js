const BaseEvent = require('../../utils/structures/BaseEvent')

module.exports = class InteractionCreate extends BaseEvent {
    constructor() {
        super('interactionCreate');
    }

    async run(client, interaction) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName)
            if (!command) return
            if (command.config.home && interaction.guild.id !== client.homeGuildId) return client.replyError(interaction, `This command is only available on the following discord server: \`${client.guilds.cache.get(client.homeGuildId)?.name}\``)
            if (!interaction.guild.members.cache.get(client.user.id).permissions.has(command.config.clientPermissions)) return client.replyError(interaction, `I don't have the required permission to execute this command : \`${command.config.clientPermissions.toString()}\``)
            if (!interaction.guild.members.cache.get(interaction.user.id).permissions.has(command.config.userPermissions)) return client.replyError(interaction, `You can't execute this command : missing permissions`)
            command.run(client, interaction, interaction.options)
        } else if (interaction.isButton()) {

        }
    }
}