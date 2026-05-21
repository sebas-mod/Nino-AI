import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'addenergi',
    alias: ['tambahenergi', 'giveenergi', 'addenergy'],
    category: 'owner',
    description: 'Agregar energia al usuario',
    usage: '.addenergi <cantidad> @user',
    example: '.addenergi 100 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function formatNumber(num) {
    if (num === -1) return '∞ Unlimited'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []

    let amount = 0
    let isUnlimited = false
    let targetJid = null

    if (m.text?.toLowerCase().includes('--unlimited') || m.text?.toLowerCase().includes('--unli')) {
        isUnlimited = true
    }

    const numArg = args.find(a => !isNaN(a) && !a.includes('@') && !a.startsWith('-'))
    if (numArg) amount = parseInt(numArg)

    if (m.quoted) {
        targetJid = m.quoted.sender
    } else if (m.mentionedJid?.length) {
        targetJid = m.mentionedJid[0]
    } else {
        const phoneArg = args.find(a => a !== numArg && a.length > 5 && /^\d+$/.test(a.replace(/[^0-9]/g, '')))
        if (phoneArg) {
            targetJid = phoneArg.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        }
    }

    if (!targetJid && (amount > 0 || isUnlimited)) {
        targetJid = m.sender
    }

    if (!targetJid || (!isUnlimited && amount <= 0)) {
        return m.reply(
            `⚡ *ᴀᴅᴅ ᴇɴᴇʀɢɪ*\n\n` +
            `> \`.addenergi <cantidad>\` - a ti mismo\n` +
            `> \`.addenergi <cantidad> @user\` - al usuario\n` +
            `> \`.addenergi --unlimited\` - unlimited\n\n` +
            `\`Ejemplo: ${m.prefix}addenergi 100\``
        )
    }

    const user = db.getUser(targetJid) || db.setUser(targetJid)

    const effectiveUnlimited = user.energi === -1 ||
        (config.isOwner(targetJid) && (config.energi?.owner ?? -1) === -1) ||
        (config.isPremium(targetJid) && (config.energi?.premium ?? -1) === -1)

    if (!isUnlimited && effectiveUnlimited) {
        return m.reply(
            `⚡ *INFORMASI*\n` +
            `@${targetJid.split('@')[0]} ya tiene energia *∞ Unlimited*\n` +
            `No hace falta agregar mas energia`,
            { mentions: [targetJid] }
        )
    }

    if (isUnlimited) {
        db.setUser(targetJid, { energi: -1 })

        await m.react('✅')
        await m.reply(
            `✅ *Energi @${targetJid.split('@')[0]} ahora es unlimited / sin limite*`,
            { mentions: [targetJid] }
        )
    } else {
        const newEnergi = db.updateEnergi(targetJid, amount)

        await m.react('✅')
        await m.reply(
            `✅ Energi *@${targetJid.split('@')[0]}* se agrego correctamente por *${formatNumber(amount)}*!\nAhora tiene *${formatNumber(newEnergi)}* energi`,
            { mentions: [targetJid] }
        )
    }
}

export { pluginConfig as config, handler }