import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: ['block', 'blokir'],
    alias: [],
    category: 'owner',
    description: 'Bloquear numero de WhatsApp',
    usage: '.block <numero/reply/mention>',
    example: '.block 628xxx',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let targetJid = null

    if (m.mentionedJid?.length > 0) {
        targetJid = m.mentionedJid[0]
    } else if (m.quoted) {
        targetJid = m.quoted.sender || m.quoted.participant
    } else if (m.args[0]) {
        let num = m.args[0].replace(/[^0-9]/g, '')
        if (!num) return m.reply('❌ Numero no valido.')
        targetJid = num + '@s.whatsapp.net'
    } else if (!m.isGroup) {
        targetJid = m.chat
    }

    if (!targetJid) {
        return m.reply(
            '⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜꜱᴏ*\n\n' +
            '> `.block 628xxx` — Bloquear por numero\n' +
            '> `.block` (responde a un mensaje) — Blokir pengirim\n' +
            '> `.block @mention` — Bloquear al mencionado\n' +
            '> `.block` (di private chat) — Blokir user ini'
        )
    }

    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    if (targetJid === botJid) {
        return m.reply('❌ No se puede bloquear el numero del propio bot.')
    }

    try {
        await sock.updateBlockStatus(targetJid, 'block')
        await m.react('🚫')
        return m.reply(
            `🚫 *ɴᴏᴍᴏʀ ᴅɪʙʟᴏᴋɪʀ*\n\n` +
            `> Objetivo: @${targetJid.split('@')[0]}\n` +
            `> Usa \`.unblock\` para abrir blokir`,
            { mentions: [targetJid] }
        )
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }