import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'automedia',
    alias: ['automedi', 'am'],
    category: 'group',
    description: 'Activa o desactiva automedia: convierte stickers automaticamente en imagenes/videos',
    usage: '.automedia on/off',
    example: '.automedia on',
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
    const args = m.args || []
    const groupData = db.getGroup(m.chat) || {}
    const current = groupData.automedia ?? false
    const arg = args[0]?.toLowerCase()
    
    if (!arg) {
        const status = current ? '✅ Aktif' : '❌ Nonactivo'
        return m.reply(
            `🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n` +
            `> Estado: ${status}\n\n` +
            `> Usa:\n` +
            `> \`${m.prefix}automedia on\` - activokan\n` +
            `> \`${m.prefix}automedia off\` - nonactivokan\n\n` +
            `> _Convierte stickers automaticamente en imagenes_\n` +
            `> El video no se convierte`
        )
    }
    
    if (arg === 'on' || arg === '1' || arg === 'activo') {
        if (current) {
            return m.reply(`🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n> Ya esta activo!`)
        }
        db.setGroup(m.chat, { automedia: true })
        await db.save()
        return m.reply(`🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n> ✅ Correcto activado!\n> El sticker se convertira automaticamente en imagen/video`)
    }
    
    if (arg === 'off' || arg === '0' || arg === 'nonactivo') {
        if (!current) {
            return m.reply(`🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n> Ya esta inactivo!`)
        }
        db.setGroup(m.chat, { automedia: false })
        await db.save()
        return m.reply(`🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n> ❌ Correcto desactivado!`)
    }
    
    return m.reply(`❌ Usa: \`${m.prefix}automedia on/off\``)
}

async function autoMediaHandler(m, sock) {
    try {
        if (!m) return false
        if (!m.isGroup) return false
        if (m.isCommand) return false
        if (m.fromMe === true) return false
        
        const db = getDatabase()
        const groupData = db.getGroup(m.chat) || {}
        
        if (!groupData.automedia) return false
        
        const msg = m.message
        if (!msg) return false
        
        const hasSticker = msg.stickerMessage
        if (!hasSticker) return false
        
        if (hasSticker.isAnimated) return false
        
        const buffer = await m.download()
        if (!buffer || buffer.length === 0) return false
        
        await sock.sendMedia(m.chat, buffer, null, m, { 
            type: 'image',
        })
        
        return true
    } catch (err) {
        return false
    }
}

export { pluginConfig as config, handler, autoMediaHandler }