import { startJadibot, isJadibotActive } from '../../src/lib/ourin-jadibot-manager.js'

const pluginConfig = {
    name: 'jadibot',
    alias: ['jadibotqr', 'becomebot', 'bot'],
    category: 'main',
    description: 'Convierte tu numero en bot (codigo de vinculacion / QR)',
    usage: '.jadibot atau .jadibot qr',
    example: '.jadibot',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const sender = m.sender
    if (!sender) return m.reply('❌ No se pudo identificar tu numero')

    if (isJadibotActive(sender)) {
        return m.reply(
            `⚠️ *ᴊᴀᴅɪʙᴏᴛ ꜱᴜᴅᴀʜ ᴀᴋᴛɪꜰ*\n\n` +
            `> Tu numero ya es un bot\n` +
            `> Escribe \`${m.prefix}stopjadibot\` para detenerlo`
        )
    }

    const arg = (m.args?.[0] || '').toLowerCase()
    const useQR = arg === 'qr'

    if (useQR) {
        await m.reply(
            `🤖 *ᴊᴀᴅɪʙᴏᴛ — Qʀ ᴍᴏᴅᴇ*\n\n` +
            `> Preparando conexion...\n` +
            `> Escanea el codigo QR que se enviara`
        )
    } else {
        await m.reply(
            `🤖 *ᴊᴀᴅɪʙᴏᴛ — ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ*\n\n` +
            `> Preparando conexion...`
        )
    }

    try {
        await startJadibot(sock, m, sender, !useQR)
    } catch (e) {
        await m.reply(
            `❌ *ᴊᴀᴅɪʙᴏᴛ ɢᴀɢᴀʟ*\n\n` +
            `> ${e.message || 'Ocurrio un error'}\n\n` +
            `Intentalo de nuevo en unos minutos.`
        )
    }
}

export { pluginConfig as config, handler }
