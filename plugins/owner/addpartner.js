import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'addpartner',
    alias: ['delpartner', 'listpartner'],
    category: 'owner',
    description: 'Gestionar lista de partners del bot',
    usage: '.addpartner <numero/@tag> [dias]\n.delpartner <numero/@tag>\n.listpartner\n.cekpartner <numero/@tag>',
    example: '.addpartner 6281234567890 30',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function extractNumber(m) {
    if (m.mentionedJid?.length) return m.mentionedJid[0]
    if (m.quoted?.sender) return m.quoted.sender

    const text = m.args?.join(' ')?.trim() || ''
    const match = text.match(/(\d{10,15})/)
    if (match) return `${match[1]}@s.whatsapp.net`

    return null
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const cmd = m.command?.toLowerCase()
    if (!db.data.partner) db.data.partner = []
    if (cmd === 'addpartner') {
        const target = await extractNumber(m)
        if (!target) {
            return m.reply(
                `🤝 *ᴀᴅᴅ ᴘᴀʀᴛɴᴇʀ*\n\n` +
                `> Modo de uso:\n` +
                `> \`${m.prefix}addpartner @tag [dias]\`\n` +
                `> \`${m.prefix}addpartner 6281xxx 30\`\n\n` +
                `> Default: 30 dias`
            )
        }
        let targetNumber = target.replace(/@.+/g, '')
        if (targetNumber.startsWith('08')) {
            targetNumber = '62' + targetNumber.slice(1)
        }
        if (config.isOwner(targetNumber)) {
            return m.reply(`⚠️ @${targetNumber} ya es owner!`, { mentions: [target] })
        }
        const existingIndex = db.data.partner.findIndex(p => p.id === targetNumber)
        const days = parseInt(m.args?.find(a => /^\d+$/.test(a) && a.length <= 4)) || 30
        const pushName = m.quoted?.pushName || m.pushName || 'Desconocido'
        const now = Date.now()
        let newExpirado
        let message = ''
        if (existingIndex !== -1) {
            const currentExpirado = db.data.partner[existingIndex].vencido || now
            const baseTime = currentExpirado > now ? currentExpirado : now
            newExpirado = baseTime + (days * 24 * 60 * 60 * 1000)
            
            db.data.partner[existingIndex].vencido = newExpirado
            db.data.partner[existingIndex].name = pushName
            message = `Partner renovado`
        } else {
            newExpirado = now + (days * 24 * 60 * 60 * 1000)
            db.data.partner.push({
                id: targetNumber,
                vencido: newExpirado,
                name: pushName,
                addedAt: now
            })
            message = `Agregado correctamente`
        }

        db.save()

        const expDate = new Date(newExpirado).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

        await m.reply(
            `✅ Correcto: ${existingIndex !== -1 ? 'renovar' : 'agregar'} partner @${targetNumber} durante *${days} dias*\nVence: *${expDate}*`,
            { mentions: [target] }
        )
        return
    }

    if (cmd === 'delpartner') {
        const target = await extractNumber(m)
        if (!target) {
            return m.reply(`⚠️ Etiqueta o responde al usuario que quieres quitar de partner.`)
        }
        let targetNumber = target.replace(/@.+/g, '')
        if (targetNumber.startsWith('08')) {
            targetNumber = '62' + targetNumber.slice(1)
        }

        const initialLength = db.data.partner.length
        db.data.partner = db.data.partner.filter(p => p.id !== targetNumber)
        
        if (db.data.partner.length < initialLength) {
            db.save()
            await m.reply(`✅ Eliminado correctamente @${targetNumber} de partner`, { mentions: [target] })
        } else {
            return m.reply(`⚠️ Ese usuario no es partner.`)
        }
        return
    }

    if (cmd === 'listpartner') {
        const partners = db.data.partner
        if (!partners.length) {
            return m.reply(`🤝 *ᴅᴀꜰᴛᴀʀ ᴘᴀʀᴛɴᴇʀ*\n\n> Todavia no hay partners.`)
        }

        let txt = `🤝 *LISTA DE PARTNERS*\n\n`
        const mentions = []
        partners.forEach((p, i) => {
            const num = p.id
            const expDate = new Date(p.vencido).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            const remaining = Math.ceil((p.vencido - Date.now()) / (1000 * 60 * 60 * 24))
            txt += `${i + 1}. @${num} — ${expDate} (${remaining > 0 ? remaining + 'd' : 'Expirado'})\n`
            mentions.push(`${num}@s.whatsapp.net`)
        })
        txt += `\nTotal: *${partners.length}* partner`
        await m.reply(txt, { mentions })
        return
    }
}

export { pluginConfig as config, handler }