import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ganti-pp-kosong.jpg',
    alias: ['gantippkosong', 'setppkosong'],
    category: 'owner',
    description: 'Cambiar imagen pp-kosong.jpg',
    usage: '.ganti-pp-kosong.jpg (responde/envia imagen)',
    example: '.ganti-pp-kosong.jpg',
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
    if (!isImage) return m.reply(`🖼️ *ɢᴀɴᴛɪ PP-KOSONG.JPG*\n\n> Envia/responde una imagen para reemplazar\n> File: assets/images/pp-kosong.jpg`)
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        if (!buffer) return m.reply('❌ Fallo: descargar imagen')
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'pp-kosong.jpg')
        fs.writeFileSync(targetPath, buffer)
        m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*\n\n> Imagen pp-kosong.jpg fue reemplazado`)
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }