import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ganti-ourin-promote.jpg',
    alias: ['gantiourinpromote', 'setourinpromote'],
    category: 'owner',
    description: 'Cambiar imagen ourin-promote.jpg',
    usage: '.ganti-ourin-promote.jpg (responde/envia imagen)',
    example: '.ganti-ourin-promote.jpg',
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
    if (!isImage) return m.reply(`🖼️ *ɢᴀɴᴛɪ OURIN-PROMOTE.JPG*\n\n> Envia/responde una imagen para reemplazar\n> File: assets/images/ourin-promote.jpg`)
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        if (!buffer) return m.reply('❌ Fallo: descargar imagen')
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'ourin-promote.jpg')
        fs.writeFileSync(targetPath, buffer)
        m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*\n\n> Imagen ourin-promote.jpg fue reemplazado`)
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }