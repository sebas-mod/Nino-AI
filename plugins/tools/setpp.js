const pluginConfig = {
    name: 'setpp',
    alias: ['setprofilebot', 'setppbot', 'setfotobot'],
    category: 'tools',
    description: 'Cambia la foto de perfil del bot',
    usage: '.setpp (responde a una imagen)',
    example: '.setpp',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let buffer = null
    if (m.quoted?.isImage) {
        try {
            buffer = await m.quoted.download()
        } catch (e) {
            await m.reply(`❌ No se pudo obtener la imagen.`)
            return
        }
    } else if (m.isImage) {
        try {
            buffer = await m.download()
        } catch (e) {
            await m.reply(`❌ No se pudo obtener la imagen.`)
            return
        }
    }
    if (!buffer) {
        await m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> Responde con una imagen + \`${m.prefix}setpp\`\n` +
            `> Envía una imagen + caption \`${m.prefix}setpp\``
        )
        return
    }
    
    try {
        const botJid = sock.user?.id
        if (!botJid) {
            await m.reply(`❌ No se encontró el JID del bot.`)
            return
        }
        
        await sock.updateProfilePicture(botJid, buffer)
        
        await m.reply(
            `✅ *ᴘᴘ ʙᴏᴛ ᴅɪᴜʙᴀʜ*\n\n` +
            `> Foto de perfil del bot actualizada correctamente!`
        )
    } catch (error) {
        await m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `> No se puede cambiar la foto del bot.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }