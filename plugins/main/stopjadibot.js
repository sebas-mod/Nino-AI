import { stopJadibot, isJadibotActive, getJadibotStatus } from '../../src/lib/ourin-jadibot-manager.js'

const pluginConfig = {
    name: 'stopjadibot',
    alias: ['berhentijadibot', 'stopbot', 'unjadibot'],
    category: 'main',
    description: 'Deten tu sesion jadibot',
    usage: '.stopjadibot',
    example: '.stopjadibot',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
}

async function handler(m, { sock }) {
    const sender = m.sender
    if (!sender) return m.reply('❌ No se pudo identificar tu numero')

    if (!isJadibotActive(sender)) {
        return m.reply(
            `❌ *ᴋᴀᴍᴜ ᴛɪᴅᴀᴋ ᴀᴅᴀʟᴀʜ ᴊᴀᴅɪʙᴏᴛ*\n\n` +
            `> Escribe \`${m.prefix}jadibot\` para convertirte en bot`
        )
    }

    const status = getJadibotStatus(sender)
    const uptime = status ? formatUptime(Date.now() - status.startedAt) : '-'

    await m.react('🕕')

    try {
        await stopJadibot(sender, false)
        await m.react('✅')

        await m.reply(
            `🛑 *ᴊᴀᴅɪʙᴏᴛ ᴅɪʜᴇɴᴛɪᴋᴀɴ*\n\n` +
            `> 📱 Numero: *@${sender.split('@')[0]}*\n` +
            `> ⏱️ Uptime: *${uptime}*\n` +
            `> 💾 Session: *Tersimpan*\n\n` +
            `Escribe \`${m.prefix}jadibot\` para activarlo de nuevo.`,
            { mentions: [sender] }
        )
    } catch (e) {
        await m.react('☢')
        await m.reply(`❌ No se pudo detener jadibot: ${e.message}`)
    }
}

export { pluginConfig as config, handler }
