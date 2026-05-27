import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'onlythisgrupos',
    alias: ['onlythisgroup', 'lockgrupos', 'lockgroup'],
    category: 'owner',
    description: 'Bot hanya activo en el grupo ini saja',
    usage: '.onlythisgrupos',
    example: '.onlythisgrupos',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const db = getDatabase()
        const current = db.setting('onlyThisGroup') || null

        if (current && (current === m.chat || current.jid === m.chat)) {
            db.setting('onlyThisGroup', null)
            db.save()
            return m.reply(`🔓 *UNLOCKED*\n\nBot kembali activo di semua grupos secara publik.`)
        }

        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const groupMetadata = await sock.groupMetadata(m.chat).catch(() => null)
        
        if (!groupMetadata) {
            return m.reply(`❌ Fallo: mendapatkan metadata grupos.`)
        }

        const participants = groupMetadata.participants
        const isBotAdmin = participants.find(p => p.id === botNumber)?.admin !== null

        if (!isBotAdmin) {
            return m.reply(`❌ *AKSES DITOLAK*\n\nBot harus menjadi admin en el grupo ini primero agar bisa mengambil tautan undangan (link grupos).`)
        }

        const inviteCode = await sock.groupInviteCode(m.chat).catch(() => null)
        
        if (!inviteCode) {
            return m.reply(`❌ Fallo: obtener enlace de invitacion del grupo. Asegurate de que el bot sea admin valido.`)
        }

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`
        const groupName = groupMetadata.subject

        db.setting('onlyThisGroup', {
            jid: m.chat,
            name: groupName,
            link: inviteLink
        })
        db.save()

        await m.reply(
            `🔒 *BLOQUEO CORRECTO*\n\n` +
            `Desde ahora, el bot solo puede usarse exclusivamente en el grupo:\n` +
            `*${groupName}*\n\n` +
            `Los usuarios de otros grupos seran dirigidos para unirse mediante el enlace:\n` +
            `${inviteLink}\n\n` +
            `Escribe \`.onlythisgrupos\` lagi para abrir kunci.`
        )
    } catch (error) {
        console.error(error)
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }