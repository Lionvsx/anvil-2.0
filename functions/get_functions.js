const { BaseChannel } = require("discord.js");

// Get roles from an array of roles names or ids
const getRoles = (roleNamesOrIds, guild) => {
    let foundRoles = [];
    let errors = [];
    for (let roleNameOrId of roleNamesOrIds) {
        let role = getRole(roleNameOrId, guild);
        if (role) {
            foundRoles.push(role);
        } else {
            errors.push(`Role with ID or name: ${roleNameOrId} not found.`);
        }
    }
    return [foundRoles, errors];
}

function getRole(roleNameOrId, guild) {
    // Try getting role by ID first
    let role = guild.roles.cache.get(roleNameOrId);

    // If not found, try getting role by name
    if (!role) {
        role = guild.roles.cache.find(r => r.name.toLowerCase().includes(roleNameOrId.toLowerCase()));
    }

    return role;
}

function getUser(userID, guild) {
    // Try getting user by ID first
    let user = guild.members.cache.get(userID);

    // If not found, try getting user by name
    if (!user) {
        user = guild.members.cache.find(u => u.user.username.toLowerCase().includes(userID.toLowerCase()));
    }

    return user;
}

function getUsers(userIDs, guild) {
    let foundUsers = [];
    let errors = [];
    for (let userID of userIDs) {
        let user = getUser(userID, guild);
        if (user) {
            foundUsers.push(user);
        } else {
            errors.push(`User with ID or name: ${userID} not found.`);
        }
    }
    return [foundUsers, errors];
}

/**
 * @name getChannel
 * @param channelNameOrId
 * @param guild
 * @returns {undefined | BaseChannel}
 */
function getChannel(channelNameOrId, guild) {
    if (!channelNameOrId) return undefined;
    // Try getting channel by ID first
    let channel = guild.channels.cache.get(channelNameOrId);

    // If not found, try getting channel by name
    if (!channel) {
        channel = guild.channels.cache.find(c => c.name.toLowerCase().includes(channelNameOrId.toLowerCase()));
    }

    return channel;
}

function getChannels(channelNamesOrIds, guild) {
    let foundChannels = [];
    let errors = [];
    for (let channelNameOrId of channelNamesOrIds) {
        let channel = getChannel(channelNameOrId, guild);
        if (channel) {
            foundChannels.push(channel);
        } else {
            errors.push(`Channel with ID or name: ${channelNameOrId} not found.`);
        }
    }
    return [foundChannels, errors];
}

module.exports = {
    getRoles,
    getRole,
    getUser,
    getUsers,
    getChannel,
    getChannels
}