import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'cekprem',
    alias: ['cekpremium', 'preminfo'],
    category: 'cek',
    description: 'Comprueba el detalle del estado premium del usuario',
    usage: '.cekprem @usuario',
    example: '.cekprem',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function formatDate(ts) {
    return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function handler(m) {
    const db = getDatabase()
    let targetNumber = ''

    if (m.quoted) {
        targetNumber = m.quoted.sender?.replace(/[^0-9]/g, '') || ''
    } else if (m.mentionedJid?.length) {
        targetNumber = m.mentionedJid[0]?.replace(/[^0-9]/g, '') || ''
    } else if (m.args?.length) {
        targetNumber = m.args[0].replace(/[^0-9]/g, '')
    } else {
        targetNumber = m.sender?.replace(/[^0-9]/g, '') || ''
    }

    if (targetNumber.startsWith('0')) targetNumber = '62' + targetNumber.slice(1)
    if (!db.data.premium) db.data.premium = []

    const premData = db.data.premium.find(p =>
        typeof p === 'string' ? p === targetNumber : p.id === targetNumber
    )
    const jid = targetNumber + '@s.whatsapp.net'
    const isConfigPrem = config.isPremium(targetNumber)
    const isConfigOwner = config.isOwner(targetNumber)

    if (!premData && !isConfigPrem && !isConfigOwner) {
        return m.reply(`❌ @${targetNumber} no es premium`, { mentions: [jid] })
    }

    const user = db.getUser(jid)
    const now = Date.now()

    let txt = `💎 *DETALLE PREMIUM*\n\n`
    txt += `👤 Usuario: @${targetNumber}\n`

    if (isConfigOwner) {
        txt += `🏷️ Rol: *👑 Owner (Permanente)*\n`
    } else if (typeof premData === 'string' || !premData?.expired) {
        txt += `🏷️ Rol: *💎 Premium (Permanente)*\n`
    } else {
        const remaining = Math.ceil((premData.expired - now) / (1000 * 60 * 60 * 24))
        const totalDays = premData.addedAt ? Math.ceil((premData.expired - premData.addedAt) / (1000 * 60 * 60 * 24)) : '?'
        txt += `📛 Nombre: *${premData.name || 'Desconocido'}*\n`
        txt += `📅 Inicio: *${premData.addedAt ? formatDate(premData.addedAt) : 'Desconocido'}*\n`
        txt += `⏳ Vence: *${formatDate(premData.expired)}*\n`
        txt += `🗓️ Duracion: *${totalDays} dias*\n`
        txt += `📊 Restante: *${remaining > 0 ? remaining + ' dias' : '⚠️ Vencido'}*\n`
    }

    if (user) {
        txt += `⚡ Energia: *${user.energi === -1 ? '∞' : (user.energi ?? 0)}*\n`
        txt += `💰 Monedas: *${user.koin === -1 ? '∞' : (user.koin ?? 0).toLocaleString('id-ID')}*\n`
        txt += `⭐ Exp: *${(user.exp ?? 0).toLocaleString('id-ID')}*\n`
        txt += `📊 Nivel: *${user.level ?? 1}*\n`
    }

    await m.reply(txt, { mentions: [jid] })
}

export { pluginConfig as config, handler }