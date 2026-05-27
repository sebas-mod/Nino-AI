const pluginConfig = {
    name: ['hapusgrupos', 'deletegrupos', 'delgrupos'],
    alias: [],
    category: 'owner',
    description: 'Salir del grupo / eliminar grupo',
    usage: '.hapusgrupos (dentro del grupo) o .hapusgrupos <jid>',
    example: '.hapusgrupos',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let targetJid = null

    if (m.args[0]) {
        targetJid = m.args[0].replace(/[^0-9@.]/g, '')
        if (!targetJid.endsWith('@g.us')) targetJid += '@g.us'
    } else if (m.isGroup) {
        targetJid = m.chat
    }

    if (!targetJid || !targetJid.endsWith('@g.us')) {
        return m.reply(
            '🗑️ *ʜᴀᴘᴜs ɢʀᴜᴘ*\n\n' +
            '> `.hapusgrupos` (dentro del grupo) — Salir de este grupo\n' +
            '> `.hapusgrupos <id_grupos>` — Salir de un grupo especifico\n\n' +
            '⚠️ El bot saldra del grupo, no lo eliminara permanentemente'
        )
    }

    try {
        const metadata = await sock.groupMetadata(targetJid).catch(() => null)
        const groupName = metadata?.subject || targetJid

        await sock.groupLeave(targetJid)
        await m.react('✅')
        return m.reply(
            `🗑️ *ʙᴏᴛ ᴋᴇʟᴜᴀʀ ᴅᴀʀɪ ɢʀᴜᴘ*\n\n` +
            `> Grupo: ${groupName}\n` +
            `> ID: ${targetJid}`
        )
    } catch (err) {
        return m.reply(`❌ Fallo: salir del grupo: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
