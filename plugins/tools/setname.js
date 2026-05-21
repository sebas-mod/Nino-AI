const pluginConfig = {
    name: 'setname',
    alias: ['setnamebot', 'setbotnama'],
    category: 'tools',
    description: 'Cambia el nombre de perfil del bot',
    usage: '.setname <nombre nuevo>',
    example: '.setname Ourin-AI',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const newName = m.text?.trim()
    
    if (!newName) {
        await m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}setname Nombre Nuevo Del Bot\``
        )
        return
    }
    
    if (newName.length < 1 || newName.length > 25) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ*\n\n` +
            `> El nombre del bot debe tener entre 1 y 25 caracteres.`
        )
        return
    }
    
    try {
        await sock.updateProfileName(newName)
        
        await m.reply(
            `✅ *ɴᴀᴍᴀ ʙᴏᴛ ᴅɪᴜʙᴀʜ*\n\n` +
            `> Nombre actual del bot: *${newName}*`
        )
    } catch (error) {
        await m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `> No se puede cambiar el nombre del bot.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }