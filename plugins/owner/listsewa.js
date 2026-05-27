import { getDatabase } from '../../src/lib/ourin-database.js'
import * as timeHelper from '../../src/lib/ourin-time.js'
const pluginConfig = {
    name: 'listsewa',
    alias: ['sewalist', 'daftarsewa'],
    category: 'owner',
    description: 'Ver lista de grupos registrados en alquiler',
    usage: '.listsewa',
    example: '.listsewa',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function formatCountdown(data) {
    if (data.status === 'vencido') return '🚫 EXPIRED (left)'
    if (data.isLifetime) return '♾️ Permanente'
    const diff = data.vencidoAt - Date.now()
    if (diff <= 0) return '❌ EXPIRED'
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
}

function getStatusEmoji(data) {
    if (data.status === 'vencido') return '🚫'
    if (data.isLifetime) return '♾️'
    const diff = data.vencidoAt - Date.now()
    if (diff <= 0) return '❌'
    if (diff <= 259200000) return '⚠️'
    return '✅'
}

function handler(m) {
    const db = getDatabase()
    if (!db.db.data.sewa) {
        db.db.data.sewa = { enabled: false, groups: {} }
        db.db.write()
    }

    const sewaGroups = db.db.data.sewa.groups || {}
    const groupIds = Object.keys(sewaGroups)

    if (groupIds.length === 0) {
        return m.reply(
            `📋 *LISTA DE ALQUILERES*\n\n` +
            `Estado: *${db.db.data.sewa.enabled ? '✅ ACTIVO' : '❌ NONACTIVO'}*\n` +
            `Belum ada grupos terdaftar\n\n` +
            `Agregar con: *${m.prefix}addsewa <link> <duracion>*`
        )
    }

    const sorted = groupIds.sort((a, b) => {
        const aData = sewaGroups[a]
        const bData = sewaGroups[b]
        if (aData.isLifetime && !bData.isLifetime) return 1
        if (!aData.isLifetime && bData.isLifetime) return -1
        return (aData.vencidoAt || 0) - (bData.vencidoAt || 0)
    })

    const active = sorted.filter(id => sewaGroups[id].isLifetime || sewaGroups[id].vencidoAt > Date.now())
    const vencido = sorted.filter(id => !sewaGroups[id].isLifetime && sewaGroups[id].vencidoAt <= Date.now())

    let text = `📋 *LISTA DE ALQUILERES*\n\n`
    text += `Status sistem: *${db.db.data.sewa.enabled ? '✅ ACTIVO' : '❌ NONACTIVO'}*\n`
    text += `Total: *${groupIds.length}* grupos (${active.length} activo, ${vencido.length} vencido)\n\n`

    for (let i = 0; i < sorted.length; i++) {
        const gid = sorted[i]
        const data = sewaGroups[gid]
        const status = getStatusEmoji(data)
        const countdown = formatCountdown(data)
        const addedDate = data.addedAt ? timeHelper.fromTimestamp(data.addedAt, 'DD/MM/YYYY') : '-'

        text += `${status} *${i + 1}. ${data.name || 'Desconocido'}*\n`
        text += `   ID: ${gid.split('@')[0]}\n`
        text += `   Restante: ${countdown}\n`
        text += `   Ditambah: ${addedDate}\n\n`
    }

    text += `*AKSI:*\n`
    text += `• *${m.prefix}renewsewa <id> <duracion>* — Perpanjang\n`
    text += `• *${m.prefix}delsewa <id>* — Eliminar de whitelist`

    return m.reply(text)
}

export { pluginConfig as config, handler }