import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ganti-ourin-v11.jpg',
    alias: ['gantiourinv11', 'setourinv11'],
    category: 'owner',
    description: 'Cambiar imagen ourin-v11.jpg',
    usage: '.ganti-ourin-v11.jpg (responde/envia imagen)',
    example: '.ganti-ourin-v11.jpg',
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
    if (!isImage) return m.reply(`🖼️ *ɢᴀɴᴛɪ OURIN-V11.JPG*\n\n> Envia/responde una imagen para reemplazar\n> File: assets/images/ourin-v11.jpg`)
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        if (!buffer) return m.reply('❌ Fallo: descargar imagen')
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'ourin-v11.jpg')
        fs.writeFileSync(targetPath, buffer)
        m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*\n\n> Imagen ourin-v11.jpg fue reemplazado`)
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }