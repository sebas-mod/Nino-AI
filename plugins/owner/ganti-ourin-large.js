import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ourin-large',
    alias: ['setourinlarge', 'gantiourinlarge'],
    category: 'owner',
    description: 'Preset: Cambiar imagen ourin.jpg, y tambien ourin-v7 hasta ourin-v11.jpg a la vez',
    usage: '.ourin-large (responde/envia imagen)',
    example: '.ourin-large',
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
        return m.reply(`🖼️ *ᴏᴜʀɪɴ ʟᴀʀɢᴇ ᴘʀᴇsᴇᴛ*\n\n> Envia/responde una imagen para reemplazar conjunto de fotos grandes (ourin.jpg, ourin-v7.jpg hasta ourin-v11.jpg) a la vez.\n> Asegurate de que la relacion de aspecto sea la deseada.`)
    }
    
    await m.react('🕕')
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            await m.react('❌')
            return m.reply(`❌ Fallo: descargar imagen`)
        }
        
        const targetImages = [
            'ourin.jpg',
            'ourin-v7.jpg',
            'ourin-v8.jpg',
            'ourin-v9.jpg',
            'ourin-v10.jpg',
            'ourin-v11.jpg'
        ]
        
        const assetsDir = path.join(process.cwd(), 'assets', 'images')
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true })
        }
        
        for (const imgName of targetImages) {
            const targetPath = path.join(assetsDir, imgName)
            fs.writeFileSync(targetPath, buffer)
        }
        
        await m.react('✅')
        m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*\n\n> Imagen bundle *ourin-large* fue reemplazado masivamente.\n> Incluye: ${targetImages.join(', ')}\n> Reinicia el bot si la imagen no cambia inmediatamente.`)
        
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }