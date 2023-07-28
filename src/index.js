const client = require('./client');
const {connect} = require('mongoose');
require('dotenv').config();
const {Configuration, OpenAIApi} = require('openai');

const config = new Configuration({
    organizationId: "org-le4yQgH85p1FXwryz6dtWDmx",
    apiKey: process.env.OPENAI_API_KEY,
});

const {
    registerCommands,
    registerEvents,
    registerInteractions,
    registerFunctions
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
    client.openAIAgent = new OpenAIApi(config);
    client.commands = new Map();
    client.interactions = new Map();
    client.openAIFunctions = new Map();
    client.functionsArray = [];
    client.conversations = {};
    client.openAIOperations = new Map();
    await registerCommands(client, '../commands');
    await registerEvents(client, '../events');
    await registerFunctions(client, '../ai/functions', false);
    await registerFunctions(client, '../ai/operations', true);
    await client.login(process.env.DISCORD_BOT_TOKEN);
})();