const pluginConfig = {
    name: 'setppgc',
    alias: ['setprofilegc', 'setppgroup', 'setppgrup'],
    category: 'group',
    description: 'Cambia la foto de perfil del grupo',
    usage: '.setppgc (reply imagen)',
    example: '.setppgc',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
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
            await m.reply(`❌ Fallido obtener imagen.`)
            return
        }
    } else if (m.isImage) {
        try {
            buffer = await m.download()
        } catch (e) {
            await m.reply(`❌ Fallido obtener imagen.`)
            return
        }
    }
    if (!buffer) {
        await m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> Reply imagen + \`${m.prefix}setppgc\`\n` +
            `> Kirim imagen + caption \`${m.prefix}setppgc\``
        )
        return
    }
    try {
        await sock.updateProfilePicture(m.chat, buffer)
        await m.reply(
            `✅ Foto profil grupo correctamente diperbarui!`
        )
    } catch (error) {
        await m.reply(
            `❌ Fallido mengubah foto grupo.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }