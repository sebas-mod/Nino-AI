import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'resetrulesgrup',
    alias: ['resetgrouprules'],
    category: 'group',
    description: 'Restablece las reglas del grupo al valor predeterminado (solo admins)',
    usage: '.resetrulesgrup',
    example: '.resetrulesgrup',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    
    db.setGroup(m.chat, { groupRules: null })
    
    m.reply(
        `✅ *ɢʀᴜᴘ ʀᴜʟᴇs ᴅɪʀᴇsᴇᴛ*\n` +
        `Rules grupo correctamente direset ke default!\n` +
        `Escribe \`${m.prefix}rulesgrup\` para ver.`
    )
}

export { pluginConfig as config, handler }
