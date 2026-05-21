import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'resetgoodbye',
    alias: ['delgoodbye', 'cleargoodbye'],
    category: 'group',
    description: 'Restablece el mensaje de despedida al predeterminado',
    usage: '.resetgoodbye',
    example: '.resetgoodbye',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat)
    
    if (!groupData?.goodbyeMsg) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> El mensaje de despedida ya esta en predeterminado`)
    }
    
    db.setGroup(m.chat, { goodbyeMsg: null })
    
    m.react('✅')
    
    await m.reply(`✅ *ɢᴏᴏᴅʙʏᴇ ᴅɪʀᴇsᴇᴛ*\nKembali ke mensaje default`)
}

export { pluginConfig as config, handler }