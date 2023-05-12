const client = require('./client');
const {connect} = require('mongoose');
require('dotenv').config();

const {
    registerCommands,
    registerEvents,
    registerInteractions
} = require('../utils/register');

connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(connection => {
    console.log(`Connected to MongoDB`)
}).catch(err => {
    if (err) throw err;
});

(async () => {
    await registerCommands(client, '../commands');
    await registerEvents(client, '../events');
    await client.login(process.env.DISCORD_BOT_TOKEN);
})();