import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ganti-ourin-rpg.jpg',
    alias: ['gantirpg', 'setourinrpg'],
    category: 'owner',
    description: 'Cambiar imagen ourin-rpg.jpg (thumbnail rpg)',
    usage: '.ganti-ourin-rpg.jpg (responde/envia imagen)',
    example: '.ganti-ourin-rpg.jpg',
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
    
    if (!isImage) {
        return m.reply(`🖼️ *ɢᴀɴᴛɪ ᴏᴜʀɪɴ-ʀᴘɢ.ᴊᴘɢ*\n\n> Envia/responde una imagen para reemplazar\n> File: assets/images/ourin-rpg.jpg`)
    }
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return m.reply(`❌ Fallo: descargar imagen`)
        }
        
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'ourin-rpg.jpg')
        
        const dir = path.dirname(targetPath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        
        fs.writeFileSync(targetPath, buffer)
        
        m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*\n\n> Imagen ourin-rpg.jpg fue reemplazado`)
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }