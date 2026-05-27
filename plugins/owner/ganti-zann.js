import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ganti-zann.jpg',
    alias: ['gantizann', 'setzann'],
    category: 'owner',
    description: 'Cambiar imagen zann.jpg',
    usage: '.ganti-zann.jpg (responde/envia imagen)',
    example: '.ganti-zann.jpg',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    if (!isImage) return m.reply(`🖼️ *ɢᴀɴᴛɪ ZANN.JPG*\n\n> Envia/responde una imagen para reemplazar\n> File: assets/images/zann.jpg`)
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        if (!buffer) return m.reply('❌ Fallo: descargar imagen')
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'zann.jpg')
        fs.writeFileSync(targetPath, buffer)
        m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*\n\n> Imagen zann.jpg fue reemplazado`)
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }