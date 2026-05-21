const pluginConfig = {
    name: 'setbio',
    alias: ['setbiobot', 'setstatus', 'setabout'],
    category: 'tools',
    description: 'Cambia la bio/estado del bot',
    usage: '.setbio <bio nueva>',
    example: '.setbio Bot WhatsApp by Lucky Archz',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const newBio = m.text?.trim()
    
    if (!newBio && m.args?.length === 0) {
        await m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}setbio Bio nueva del bot\`\n` +
            `> \`${m.prefix}setbio clear\` - Eliminar bio`
        )
        return
    }
    
    const bioToSet = newBio?.toLowerCase() === 'clear' ? '' : (newBio || '')
    
    if (bioToSet.length > 139) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ*\n\n` +
            `> La bio debe tener máximo 139 caracteres.`
        )
        return
    }
    
    try {
        await sock.updateProfileStatus(bioToSet)
        
        if (bioToSet) {
            await m.reply(
                `✅ *ʙɪᴏ ʙᴏᴛ ᴅɪᴜʙᴀʜ*\n\n` +
                `> Bio actual del bot:\n` +
                `> _${bioToSet}_`
            )
        } else {
            await m.reply(
                `✅ *ʙɪᴏ ʙᴏᴛ ᴅɪʜᴀᴘᴜs*\n\n` +
                `> Bio del bot eliminada correctamente!`
            )
        }
    } catch (error) {
        await m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `> No se puede cambiar la bio del bot.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }