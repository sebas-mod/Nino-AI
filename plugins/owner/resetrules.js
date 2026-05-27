import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'resetrules',
    alias: ['resetbotrules'],
    category: 'owner',
    description: 'Reset rules bot ke default',
    usage: '.resetrules',
    example: '.resetrules',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    
    db.setting('botRules', null)
    
    m.reply(
        `✅ *ʙᴏᴛ ʀᴜʟᴇs ᴅɪʀᴇsᴇᴛ*\n\n` +
        `> Reglas del bot restablecidas a los valores por defecto!\n` +
        `> Escribe \`${m.prefix}rules\` para ver.`
    )
}

export { pluginConfig as config, handler }