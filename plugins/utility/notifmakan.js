import { setNotifMakan, toggleNotif, getNotif, deleteNotif, parseJadwal } from '../../src/lib/ourin-notif-scheduler.js'

const pluginConfig = {
    name: 'notifmakan',
    alias: ['jadwalmakan', 'makanreminder'],
    category: 'group',
    description: 'Configura recordatorios automáticos para comer',
    usage: '.notifmakan on <hora1,hora2,...> [menú] / off / edit <hora1,hora2,...> [menú]',
    example: '.notifmakan on 07.00,12.00,19.00 Nasi Padang',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const args = m.args || []
    const sub = args[0]?.toLowerCase()
    const chatJid = m.chat
    const sender = m.sender

    const existing = getNotif('makan', sender, chatJid)

    if (!sub || !['on', 'off', 'edit'].includes(sub)) {
        const status = existing
            ? (existing.enabled ? '✅ Activo' : '❌ Inactivo')
            : '⚪ Sin configurar'

        let info = `🍽️ *RECORDATORIO PARA COMER*\n\n`
        info += `📌 *Estado:* ${status}\n`

        if (existing) {
            info += `⏰ *Horario:* ${existing.jadwal.map(j => `*${j}* WIB`).join(', ')}\n`
            if (existing.menu) info += `🍴 *Menú:* _${existing.menu}_\n`
        }

        info += `\n*📋 Modo de uso:*\n`
        info += `> \`${m.prefix}notifmakan on 07.00,12.00,19.00\`\n`
        info += `> \`${m.prefix}notifmakan on 07.00,12.00 Nasi Goreng\`\n`
        info += `> \`${m.prefix}notifmakan edit 08.00,13.00\`\n`
        info += `> \`${m.prefix}notifmakan off\`\n`
        info += `\n> 💡 _La hora puede usar punto o dos puntos (07.00 / 07:00)_\n`
        info += `> 💡 _Puedes poner varias horas, separadas por comas_`

        return m.reply(info)
    }

    if (sub === 'off') {
        if (!existing) {
            return m.reply(`❌ *Todavía no hay recordatorios para comer* activos en este chat`)
        }
        toggleNotif('makan', sender, chatJid, false)
        return m.reply(`✅ *Recordatorio para comer desactivado* 🔕\n\n> Escribe \`${m.prefix}notifmakan on\` para activarlo de nuevo`)
    }

    if (sub === 'on') {
        if (existing?.enabled && args.length === 1) {
            return m.reply(`⚠️ *El recordatorio para comer ya está activo!*\n\n⏰ Horario: ${existing.jadwal.map(j => `*${j}*`).join(', ')} WIB\n\n> Usa \`${m.prefix}notifmakan edit\` para cambiar el horario`)
        }

        if (existing && args.length === 1) {
            toggleNotif('makan', sender, chatJid, true)
            return m.reply(`✅ *Recordatorio para comer activado de nuevo!* 🔔\n\n⏰ Horario: ${existing.jadwal.map(j => `*${j}*`).join(', ')} WIB`)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌ *Ingresa el horario para comer!*\n\n> Ejemplo: \`${m.prefix}notifmakan on 07.00,12.00,19.00\``)
        }

        const jadwal = parseJadwal(timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌ *Formato de hora incorrecto!*\n\n> Usa el formato *HH.MM* o *HH:MM*\n> Ejemplo: \`07.00,12.30,19.00\``)
        }

        const menu = args.slice(2).join(' ').trim()
        setNotifMakan(sender, chatJid, jadwal, menu)

        let reply = `✅ *Recordatorio para comer activo!* 🔔\n\n`
        reply += `⏰ *Horario:*\n`
        for (const j of jadwal) {
            const label = getMealLabel(j)
            reply += `> 🕐 *${j}* WIB _(${label})_\n`
        }
        if (menu) reply += `\n🍴 *Menú:* _${menu}_`
        reply += `\n\n> 💡 _La notificación se enviará a este chat todos los días_`

        return m.reply(reply)
    }

    if (sub === 'edit') {
        if (!existing) {
            return m.reply(`❌ *Todavía no hay recordatorio para comer!*\n\n> Actívalo primero: \`${m.prefix}notifmakan on 07.00,12.00,19.00\``)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌ *Ingresa el nuevo horario!*\n\n> Ejemplo: \`${m.prefix}notifmakan edit 08.00,13.00,20.00\``)
        }

        const jadwal = parseJadwal(timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌ *Formato de hora incorrecto!*\n\n> Usa el formato *HH.MM* o *HH:MM*\n> Ejemplo: \`08.00,13.00,20.00\``)
        }

        const menu = args.slice(2).join(' ').trim() || existing.menu || ''
        setNotifMakan(sender, chatJid, jadwal, menu)

        let reply = `✅ *Horario para comer actualizado!* ✏️\n\n`
        reply += `⏰ *Nuevo horario:*\n`
        for (const j of jadwal) {
            const label = getMealLabel(j)
            reply += `> 🕐 *${j}* WIB _(${label})_\n`
        }
        if (menu) reply += `\n🍴 *Menú:* _${menu}_`

        return m.reply(reply)
    }
}

function getMealLabel(jam) {
    const hour = parseInt(jam.split(':')[0], 10)
    if (hour >= 4 && hour < 10) return 'mañana'
    if (hour >= 10 && hour < 15) return 'mediodía'
    if (hour >= 15 && hour < 18) return 'tarde'
    return 'noche'
}

export { pluginConfig as config, handler }
