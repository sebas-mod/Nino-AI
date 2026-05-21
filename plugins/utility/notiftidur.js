import { setNotifTidur, toggleNotif, getNotif, deleteNotif, parseJadwal } from '../../src/lib/ourin-notif-scheduler.js'

const pluginConfig = {
    name: 'notiftidur',
    alias: ['jadwaltidur', 'tidurreminder', 'sleepreminder'],
    category: 'group',
    description: 'Configura recordatorios automáticos para dormir',
    usage: '.notiftidur on <hora1,hora2,...> / off / edit <hora1,hora2,...>',
    example: '.notiftidur on 22.00',
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

    const existing = getNotif('tidur', sender, chatJid)

    if (!sub || !['on', 'off', 'edit'].includes(sub)) {
        const status = existing
            ? (existing.enabled ? '✅ Activo' : '❌ Inactivo')
            : '⚪ Sin configurar'

        let info = `🌙 *RECORDATORIO PARA DORMIR*\n\n`
        info += `📌 *Estado:* ${status}\n`

        if (existing) {
            info += `⏰ *Horario:* ${existing.jadwal.map(j => `*${j}* WIB`).join(', ')}\n`
        }

        info += `\n*📋 Modo de uso:*\n`
        info += `> \`${m.prefix}notiftidur on 22.00\`\n`
        info += `> \`${m.prefix}notiftidur on 22.00,23.30\`\n`
        info += `> \`${m.prefix}notiftidur edit 23.00\`\n`
        info += `> \`${m.prefix}notiftidur off\`\n`
        info += `\n> 💡 _La hora puede usar punto o dos puntos (22.00 / 22:00)_\n`
        info += `> 💡 _Puedes poner varias horas, separadas por comas_`

        return m.reply(info)
    }

    if (sub === 'off') {
        if (!existing) {
            return m.reply(`❌ *Todavía no hay recordatorios para dormir* activos en este chat`)
        }
        toggleNotif('tidur', sender, chatJid, false)
        return m.reply(`✅ *Recordatorio para dormir desactivado* 🔕\n\n> Escribe \`${m.prefix}notiftidur on\` para activarlo de nuevo`)
    }

    if (sub === 'on') {
        if (existing?.enabled && args.length === 1) {
            return m.reply(`⚠️ *El recordatorio para dormir ya está activo!*\n\n⏰ Horario: ${existing.jadwal.map(j => `*${j}*`).join(', ')} WIB\n\n> Usa \`${m.prefix}notiftidur edit\` para cambiar el horario`)
        }

        if (existing && args.length === 1) {
            toggleNotif('tidur', sender, chatJid, true)
            return m.reply(`✅ *Recordatorio para dormir activado de nuevo!* 🔔\n\n⏰ Horario: ${existing.jadwal.map(j => `*${j}*`).join(', ')} WIB`)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌ *Ingresa el horario para dormir!*\n\n> Ejemplo: \`${m.prefix}notiftidur on 22.00\``)
        }

        const jadwal = parseJadwal(timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌ *Formato de hora incorrecto!*\n\n> Usa el formato *HH.MM* o *HH:MM*\n> Ejemplo: \`22.00\` o \`23.30\``)
        }

        setNotifTidur(sender, chatJid, jadwal)

        let reply = `✅ *Recordatorio para dormir activo!* 🔔\n\n`
        reply += `⏰ *Horario:*\n`
        for (const j of jadwal) {
            reply += `> 🕐 *${j}* WIB\n`
        }
        reply += `\n> 💡 _La notificación se enviará a este chat todos los días_`

        return m.reply(reply)
    }

    if (sub === 'edit') {
        if (!existing) {
            return m.reply(`❌ *Todavía no hay recordatorio para dormir!*\n\n> Actívalo primero: \`${m.prefix}notiftidur on 22.00\``)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌ *Ingresa el nuevo horario!*\n\n> Ejemplo: \`${m.prefix}notiftidur edit 23.00\``)
        }

        const jadwal = parseJadwal(timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌ *Formato de hora incorrecto!*\n\n> Usa el formato *HH.MM* o *HH:MM*\n> Ejemplo: \`23.00\` o \`22.30\``)
        }

        setNotifTidur(sender, chatJid, jadwal)

        let reply = `✅ *Horario para dormir actualizado!* ✏️\n\n`
        reply += `⏰ *Nuevo horario:*\n`
        for (const j of jadwal) {
            reply += `> 🕐 *${j}* WIB\n`
        }

        return m.reply(reply)
    }
}

export { pluginConfig as config, handler }
