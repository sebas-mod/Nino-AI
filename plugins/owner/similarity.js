import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'similarity',
    alias: ['setsimilarity', 'sim'],
    category: 'owner',
    description: 'Activar/desactivar similarity (sugerencias por errores de tipeo)',
    usage: '.similarity <on/off>',
    example: '.similarity on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args
    
    if (!args[0]) {
        return m.reply(`⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜꜱᴏ*\n\n> \`.similarity on\` - Activar\n> \`.similarity off\` - Desactivar`)
    }
    
    const mode = args[0].toLowerCase()
    
    if (mode === 'on') {
        db.setting('similarity', true)
        await m.react('✅')
        await m.reply(`✅ *sᴜᴋsᴇs*\n\n> La funcion similarity de comandos fue *ACTIVADA*`)
    } else if (mode === 'off') {
        db.setting('similarity', false)
        await m.react('✅')
        await m.reply(`✅ *sᴜᴋsᴇs*\n\n> La funcion similarity de comandos fue *DESACTIVADA*`)
    } else {
        return m.reply(`⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜꜱᴏ*\n\n> \`.similarity on\` - Activar\n> \`.similarity off\` - Desactivar`)
    }
    
    await db.save()
}

export { pluginConfig as config, handler }