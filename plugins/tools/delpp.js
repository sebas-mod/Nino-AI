const pluginConfig = {
    name: 'delpp',
    alias: ['delprofilebot', 'delppbot', 'hapusppbot'],
    category: 'tools',
    description: 'Elimina la foto de perfil del bot',
    usage: '.delpp',
    example: '.delpp',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const botJid = sock.user?.id
        if (!botJid) {
            await m.reply(`❌ No se encontró el JID del bot.`)
            return
        }
        
        await sock.removeProfilePicture(botJid)
        
        await m.reply(
            `✅ *ᴘᴘ ʙᴏᴛ ᴅɪʜᴀᴘᴜs*\n\n` +
            `> Foto de perfil del bot eliminada correctamente!`
        )
    } catch (error) {
        await m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `> No se puede eliminar la foto del bot.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }