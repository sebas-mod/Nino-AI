import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'delantilink',
    alias: ['delalink', 'delblocklink', 'remantilink'],
    category: 'group',
    description: 'Elimina un enlace de la lista antilink',
    usage: '.delantilink <domain/pattern>',
    example: '.delantilink tiktok.com',
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
    const link = m.args.join(' ')?.trim()?.toLowerCase()
    
    if (!link) {
        const groupData = db.getGroup(m.chat) || {}
        const antilinkList = groupData.antilinkList || []
        
        if (antilinkList.length === 0) {
            return m.reply(`📋 Lista antilink kosong!`)
        }
        
        let txt = `🔗 *ᴅᴀꜰᴛᴀʀ ᴀɴᴛɪʟɪɴᴋ*\n\n`
        antilinkList.forEach((l, i) => {
            txt += `> ${i + 1}. \`${l}\`\n`
        })
        txt += `\n> Total: *${antilinkList.length}* link`
        txt += `\n\n\`${m.prefix}delantilink <domain>\` para eliminar`
        
        return m.reply(txt)
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const antilinkList = groupData.antilinkList || []
    
    const index = antilinkList.findIndex(l => l === link)
    
    if (index === -1) {
        return m.reply(`⚠️ Link \`${link}\` no se encontro en la lista antilink!`)
    }
    
    antilinkList.splice(index, 1)
    db.setGroup(m.chat, { antilinkList })
    
    m.reply(
        `✅ *ᴀɴᴛɪʟɪɴᴋ ᴅɪʜᴀᴘᴜs*\n\n` +
        `> Link: \`${link}\`\n` +
        `> Quedan: *${antilinkList.length}* link`
    )
}

export { pluginConfig as config, handler }