const pluginConfig = {
    name: 'toimg',
    alias: ['toimage', 'stickertoimage', 'stimg'],
    category: 'tools',
    description: 'Convierte sticker a imagen',
    usage: '.toimg (responde/caption sticker)',
    example: '.toimg',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    let mediaSource = null
    let downloadFn = null
    const selfIsSticker = m.isSticker || 
                          m.type === 'stickerMessage' || 
                          m.message?.stickerMessage
    const quotedIsSticker = m.quoted && (
        m.quoted.isSticker || 
        m.quoted.type === 'stickerMessage' || 
        m.quoted.mtype === 'stickerMessage' ||
        m.quoted.message?.stickerMessage
    )
    
    if (selfIsSticker) {
        mediaSource = 'self'
        downloadFn = m.download
    } else if (quotedIsSticker) {
        mediaSource = 'quoted'
        downloadFn = m.quoted.download
    }
    
    if (!mediaSource) {
        await m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `> No se detectó ningún sticker!\n\n` +
            `*Modo de uso:*\n` +
            `> 1. Envía sticker + caption \`${m.prefix}toimg\`\n` +
            `> 2. Responde al sticker con \`${m.prefix}toimg\``
        )
        return
    }

    const stickerMsg = mediaSource === 'self' 
        ? m.message?.stickerMessage 
        : m.quoted?.message?.stickerMessage
    const isAnimated = stickerMsg?.isAnimated

    if (isAnimated) {
        await m.reply(
            `⚠️ *sᴛɪᴄᴋᴇʀ ᴀɴɪᴍᴀsɪ*\n\n` +
            `> Este sticker es animado (GIF).\n` +
            `> Usa \`${m.prefix}tovideo\` para convertirlo.`
        )
        return
    }

    await m.react('🕕')

    try {
        const buffer = await downloadFn()

        if (!buffer || buffer.length === 0) {
            await m.reply(
                `❌ *ɢᴀɢᴀʟ*\n\n` +
                `> No se puede descargar el sticker.\n` +
                `> Es posible que el sticker ya no esté disponible.`
            )
            return
        }

        if (buffer.length < 100) {
            await m.reply(
                `❌ *ꜰɪʟᴇ ᴋᴏʀᴜᴘ*\n\n` +
                `> El archivo de sticker no es válido o está dañado.\n` +
                `> Intenta enviar el sticker de nuevo.`
            )
            return
        }

        await sock.sendMedia(m.chat, buffer, null, m, {
            type: 'image'
        })

    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> Ocurrió un error al procesar.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }