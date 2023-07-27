const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
    guildId: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    },
    guildName: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    slashCommands: {
        type: Boolean,
        default: true
    },
    logChannelId: String,
    home: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Guild', GuildSchema);