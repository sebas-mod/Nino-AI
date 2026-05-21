import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'antilinkgc',
    alias: ['algc', 'antilinkgrup'],
    category: 'group',
    description: 'Anti enlaces de WhatsApp (grupos, canales, wa.me)',
    usage: '.antilinkgc <on/off/metode> [kick/remove]',
    example: '.antilinkgc on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}



function handler(m, { sock }) {
    const db = getDatabase()
    const option = m.text?.toLowerCase()?.trim()
    
    if (!option) {
        const groupData = db.getGroup(m.chat) || {}
        const status = groupData.antilinkgc || 'off'
        const mode = groupData.antilinkgcMode || 'remove'
        
        return m.reply(
            `🔗 *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ*\n\n` +
            `╭┈┈⬡「 📋 *sᴛᴀᴛᴜs* 」\n` +
            `┃ ◦ Estado: *${status.toUpperCase()}*\n` +
            `┃ ◦ Mode: *${mode.toUpperCase()}*\n` +
            `╰┈┈⬡\n\n` +
            `*ᴅᴇᴛᴇᴋsɪ:*\n` +
            `> • chat.whatsapp.com (grupo)\n` +
            `> • wa.me (kontak)\n` +
            `> • whatsapp.com/channel (saluran)\n\n` +
            `*ᴄᴀʀᴀ ᴘᴀᴋᴀɪ:*\n` +
            `> \`${m.prefix}antilinkgc on\` - Activar\n` +
            `> \`${m.prefix}antilinkgc off\` - Desactivar\n` +
            `> \`${m.prefix}antilinkgc metode kick\` - Mode kick user\n` +
            `> \`${m.prefix}antilinkgc metode remove\` - Modo eliminar mensaje`
        )
    }
    
    if (option === 'on') {
        db.setGroup(m.chat, { antilinkgc: 'on' })
        return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* activado!\n\n> Los enlaces de WhatsApp se eliminaran automaticamente.`)
    }
    
    if (option === 'off') {
        db.setGroup(m.chat, { antilinkgc: 'off' })
        return m.reply(`❌ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* desactivado!`)
    }
    
    if (option.startsWith('metode')) {
        const method = m.args?.[1]?.toLowerCase()
        if (method === 'kick') {
            db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'kick' })
            return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* mode KICK activado!\n\n> El usuario que envie un enlace de WhatsApp sera expulsado.`)
        } else if (method === 'remove' || method === 'delete') {
            db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'remove' })
            return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* mode DELETE activado!\n\n> El mensaje con enlace de WhatsApp sera eliminado.`)
        } else {
            return m.reply(`❌ Metode no valido! Usa: \`kick\` o \`remove\`\n\n> Ejemplo: \`${m.prefix}antilinkgc metode kick\``)
        }
    }
    
    if (option === 'kick') {
        db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'kick' })
        return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* mode KICK activado!\n\n> El usuario que envie un enlace de WhatsApp sera expulsado.`)
    }
    
    if (option === 'remove' || option === 'delete') {
        db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'remove' })
        return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* mode DELETE activado!\n\n> El mensaje con enlace de WhatsApp sera eliminado.`)
    }
    
    return m.reply(`❌ Opsi no valido! Usa: \`on\`, \`off\`, \`metode kick\`, \`metode remove\``)
}

export { pluginConfig as config, handler }