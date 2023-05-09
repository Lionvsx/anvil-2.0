const { Client, GatewayIntentBits, Options, Interaction, Message, TextChannel, DMChannel, Partials} = require('discord.js');
require('dotenv').config();
const Logger = require('../utils/services/logger')


class client extends Client {
    constructor(homeGuildId) {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.GuildBans,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageTyping,
                GatewayIntentBits.MessageContent,
            ],
            partials: [
                Partials.Message,
                Partials.Channel,
                Partials.GuildMember,
                Partials.Reaction,
                Partials.User,
            ],
            makeCache: Options.cacheWithLimits(Options.DefaultMakeCacheSettings)
        })
        this.homeGuildId = homeGuildId
        this.commands = new Map();
        this.interactions = new Map();
        this.config = new Map();
        this.consoleLogger = new Logger('client');
    }

    /**
     *
     * @param message {String}
     * @param logData {JSON}
     * @return {void}
     */
    log(message, logData = undefined) {
        this.consoleLogger.log(message, 'info', logData);
    }

    /**
     *
     * @param message {String}
     * @param logData {JSON}
     * @return {void}
     */
    error(message, logData = undefined) {
        this.consoleLogger.log(message, 'error', logData);
    }
    /**
     *
     * @param message {String}
     * @param logData {JSON}
     * @return {void}
     */
    warning(message, logData = undefined) {
        this.consoleLogger.log(message, 'warn', logData);
    }
    async replySuccess(object, content) {
        if (object instanceof Interaction) return object.reply({content: `**${this.successEmoji} | **${content}`})
        if (object instanceof Message) return object.reply(`**${this.successEmoji} | **${content}`)
        if (object instanceof TextChannel) return object.send(`**${this.successEmoji} | **${content}`)
        if (object instanceof DMChannel) return object.send(`**${this.successEmoji} | **${content}`)
    }

    async replyError(object, content) {
        if (object instanceof Interaction) return object.reply({content: `**${this.errorEmoji} | **${content}`, ephemeral: true})
        if (object instanceof Message) return object.reply(`**${this.errorEmoji} | **${content}`)
        if (object instanceof TextChannel) return object.send(`**${this.errorEmoji} | **${content}`)
        if (object instanceof DMChannel) return object.send(`**${this.errorEmoji} | **${content}`)
    }

    async replyWarning(object, content) {
        if (object instanceof Interaction) return object.reply({content: `**${this.warningEmoji} | **${content}`, ephemeral: true})
        if (object instanceof Message) return object.reply(`**${this.warningEmoji} | **${content}`)
        if (object instanceof TextChannel) return object.send(`**${this.warningEmoji} | **${content}`)
        if (object instanceof DMChannel) return object.send(`**${this.warningEmoji} | **${content}`)
    }

    async replyLoading(object, content) {
        if (object instanceof Interaction) return object.reply({content: `**${this.loadingEmoji} | **${content}`})
        if (object instanceof Message) return object.reply(`**${this.loadingEmoji} | **${content}`)
        if (object instanceof TextChannel) return object.send(`**${this.loadingEmoji} | **${content}`)
        if (object instanceof DMChannel) return object.send(`**${this.loadingEmoji} | **${content}`)
    }
    get loadingEmoji() {
        return this.emojis.cache.get('741276138319380583') ?? '🔄';
    }

    get successEmoji() {
        return this.emojis.cache.get('745912720502554635') ?? '✅';
    }

    get errorEmoji() {
        return this.emojis.cache.get('745912720565731328') ?? '❌';
    }

    get warningEmoji() {
        return this.emojis.cache.get('822782781960355850') ?? '⚠️';
    }

    get commandsJSON() {
        const commands = []
        for (const [name, command] of this.commands) {
            commands.push(command.builder.toJSON())
        }
        return commands;
    }

}
const discordClient = new client(process.env.HOMEGUILDID);
module.exports = discordClient;