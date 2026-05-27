import moment from 'moment-timezone'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'botafk',
    alias: ['afkbot', 'afkmode'],
    category: 'owner',
    description: 'Modo AFK para el bot: el bot no responde comandos, solo responde mensajes AFK',
    usage: '.botafk <alasan>',
    example: '.botafk Estoy descansando',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const currentAfk = db.setting('botAfk')
    
    if (currentAfk && currentAfk.active) {
        db.setting('botAfk', { active: false })
        await m.react('✅')
        
        const afkDuration = Date.now() - currentAfk.since
        const duration = formatDuration(afkDuration)
        
        return m.reply(
            `✅ *ʙᴏᴛ ᴋᴇᴍʙᴀʟɪ ᴏɴʟɪɴᴇ*\n\n` +
            `╭┈┈⬡「 📊 *sᴛᴀᴛɪsᴛɪᴋ ᴀꜰᴋ* 」\n` +
            `┃ ⏱️ ᴅᴜʀᴀsɪ: \`${duration}\`\n` +
            `┃ 📝 ᴀʟᴀsᴀɴ: \`${currentAfk.reason || '-'}\`\n` +
            `╰┈┈⬡\n\n` +
            `> El bot esta listo para recibir comandos!`
        )
    } else {
        const reason = m.args.join(' ') || 'AFK'
        
        db.setting('botAfk', {
            active: true,
            reason: reason,
            since: Date.now()
        })
        
        await m.react('💤')
        return m.reply(
            `💤 *ʙᴏᴛ ᴀꜰᴋ ᴀᴋᴛɪꜰ*\n\n` +
            `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
            `┃ 📝 ᴀʟᴀsᴀɴ: \`${reason}\`\n` +
            `┃ ⏰ ᴅᴇꜱᴅᴇ: \`${moment().tz('Asia/Jakarta').format('HH:mm:ss')}\`\n` +
            `╰┈┈⬡\n\n` +
            `╭┈┈⬡「 🔒 *ᴀᴋsᴇs* 」\n` +
            `┃ ✅ Owner bot\n` +
            `┃ ✅ Bot sendiri (fromMe)\n` +
            `┃ ❌ Todos los demas usuarios\n` +
            `╰┈┈⬡\n\n` +
            `> Los demas usuarios recibiran el mensaje AFK\n` +
            `> Escribe \`${m.prefix}botafk\` para volver en linea`
        )
    }
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} dias ${hours % 24} horas`
    if (hours > 0) return `${hours} horas ${minutes % 60} minutos`
    if (minutes > 0) return `${minutes} minutos ${seconds % 60} detik`
    return `${seconds} detik`
}

export { pluginConfig as config, handler }