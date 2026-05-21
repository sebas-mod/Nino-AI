import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'addkoin',
    alias: ['tambahkoin', 'givekoin', 'addcoin', 'adddcoin'],
    category: 'owner',
    description: 'Agregar monedas al usuario (max. 9 billones)',
    usage: '.addkoin <cantidad> @user',
    example: '.addkoin 100000 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const MAX_KOIN = 9000000000000
function formatKoin(num) {
    if (num === -1) return '∞ Unlimited'
    if (num >= 1000000000000) return (num / 1000000000000).toFixed(2) + 'T'
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []

    const numArg = args.find(a => !isNaN(a) && !a.startsWith('@'))
    let amount = parseInt(numArg) || 0

    let targetJid = null
    if (m.quoted) {
        targetJid = m.quoted.sender
    } else if (m.mentionedJid?.length) {
        targetJid = m.mentionedJid[0]
    }

    if (!targetJid && amount > 0) {
        targetJid = m.sender
    }

    if (!targetJid || amount <= 0) {
        return m.reply(
            `💰 *ᴀᴅᴅ ᴋᴏɪɴ*\n\n` +
            `> \`.addkoin <cantidad>\` - a ti mismo\n` +
            `> \`.addkoin <cantidad> @user\` - ke orang lain\n` +
            `> Max: 9.000.000.000.000 (9T)\n\n` +
            `\`Ejemplo: ${m.prefix}addkoin 100000\``
        )
    }

    if (amount > MAX_KOIN) amount = MAX_KOIN

    const user = db.getUser(targetJid) || db.setUser(targetJid)

    if (user.koin === -1) {
        return m.reply(
            `💰 *INFORMATION*\n` +
            `@${targetJid.split('@')[0]} ya tiene monedas *∞ Unlimited*\n` +
            `No hace falta agregar mas monedas`,
            { mentions: [targetJid] }
        )
    }

    const newKoin = db.updateKoin(targetJid, amount)

    await m.react('✅')
    await m.reply(
        `✅ Monedas agregadas correctamente a *@${targetJid.split('@')[0]}* sebanyak *${formatKoin(amount)}*`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }