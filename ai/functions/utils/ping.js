const BaseFunction = require('../../../utils/structures/BaseFunction')
const {EmbedBuilder} = require("discord.js");

module.exports = class PingFunction extends BaseFunction {
    constructor() {
        super('ping', 'utilities', "Get the ping of the bot", {
            waiting: "Trying to ping ...",
            finish: "Operation ping successful",
            error: "Error while pinging"
        })
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

    async run(client, message, params) {
        const loading = client.emojis.cache.get('741276138319380583')
        let msg = await message.channel.send(`**${loading} | **Pinging server ...`)
        let embed = new EmbedBuilder()
            .setColor('#2b2d31')
        msg.edit({
            content: ' ',
            embeds: [embed.addFields([
                {name: 'Ping', value: `\`${msg.createdTimestamp - message.createdTimestamp} ms\``, inline: true},
                {name: 'API Latency', value: `\`${Math.round(client.ws.ping)} ms\``, inline: true}
            ])]
        })
        return [false, `Ping : ${msg.createdTimestamp - message.createdTimestamp} ms\nAPI Latency : ${Math.round(client.ws.ping)} ms`, false]
    }
}