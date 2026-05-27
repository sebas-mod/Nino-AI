import { getAllJadibotSessions, getActiveJadibots } from '../../src/lib/ourin-jadibot-manager.js'
const pluginConfig = {
    name: 'listjadibot',
    alias: ['jadibotlist', 'alljadibot'],
    category: 'owner',
    description: 'Ver todas las sesiones jadibot guardadas',
    usage: '.listjadibot',
    example: '.listjadibot',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const sessions = getAllJadibotSessions()
    const active = getActiveJadibots()

    if (sessions.length === 0) {
        return m.reply(`❌ No hay sesiones jadibot guardadas`)
    }

    let txt = `🤖 *ᴅᴀꜰᴛᴀʀ ᴊᴀᴅɪʙᴏᴛ*\n\n`
    txt += `> 📊 Total: *${sessions.length}* session\n`
    txt += `> 🟢 Activo: *${active.length}*\n`
    txt += `> ⚫ Offline: *${sessions.length - active.length}*\n\n`

    sessions.forEach((s, i) => {
        const status = s.isActive ? '🟢' : '⚫'
        const label = s.isActive ? 'Online' : 'Offline'
        txt += `${status} *${i + 1}.* @${s.id} — _${label}_\n`
    })

    txt += `\n> \`${m.prefix}listjadibotactivo\` — Detalle activo\n`
    txt += `> \`${m.prefix}stopalljadibot\` — Detener todo\n`
    txt += `> \`${m.prefix}stopdandeletejadibot @user\` — Hapus session`

    const mentions = sessions.map(s => s.jid)

    await sock.sendMessage(m.chat, {
        text: txt,
        mentions,
        interactiveButtons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '🟢 Lihat Activo',
                    id: `${m.prefix}listjadibotactivo`
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '🛑 Detener todo',
                    id: `${m.prefix}stopalljadibot`
                })
            }
        ]
    }, { quoted: m })
}

export { pluginConfig as config, handler }