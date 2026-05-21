import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'addantilink',
    alias: ['addalink', 'addblocklink'],
    category: 'group',
    description: 'Agrega un enlace a la lista antilink',
    usage: '.addantilink <domain/pattern>',
    example: '.addantilink tiktok.com',
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
    const link = m.text?.toLowerCase()
    
    if (!link) {
        return m.reply(
            `🔗 *ᴀᴅᴅ ᴀɴᴛɪʟɪɴᴋ*\n\n` +
            `> Ingresa dominio/patron de enlace que quieres bloquear\n\n` +
            `\`Ejemplo:\`\n` +
            `\`${m.prefix}addantilink tiktok.com\`\n` +
            `\`${m.prefix}addantilink chat.whatsapp.com\`\n` +
            `\`${m.prefix}addantilink instagram.com\``
        )
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const antilinkList = groupData.antilinkList || []
    
    if (antilinkList.includes(link)) {
        return m.reply(`⚠️ Link \`${link}\` ya existe en la lista antilink!`)
    }
    
    antilinkList.push(link)
    db.setGroup(m.chat, { antilinkList })
    
    m.reply(
        `✅ *ᴀɴᴛɪʟɪɴᴋ ᴅɪᴛᴀᴍʙᴀʜ*\n\n` +
        `> Link: \`${link}\`\n` +
        `> Total: *${antilinkList.length}* link\n\n` +
        `> Usa \`${m.prefix}listantilink\` para ver la lista`
    )
}

export { pluginConfig as config, handler }