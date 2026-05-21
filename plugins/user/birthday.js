import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'birthday',
    alias: ['bday', 'ultah', 'ulangtahun'],
    category: 'user',
    description: 'Ver cumpleaños de un miembro',
    usage: '.birthday [@usuario]',
    example: '.birthday @usuario',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
    const cleanJid = target.replace(/@.+/g, '')
    const db = getDatabase()
    const user = db.getUser(target)
    
    if (!user?.birthday) {
        if (target === m.sender) {
            return m.reply(
                `❌ Todavía no configuraste tu cumpleaños!\n\n` +
                `> Usa: ${m.prefix}setbirthday DD-MM\n` +
                `> Ejemplo: ${m.prefix}setbirthday 25-12`
            )
        }
        return m.reply(`❌ El usuario todavía no configuró su cumpleaños!`)
    }
    
    const [day, month] = user.birthday.split('-').map(Number)
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    
    const now = new Date()
    const currentYear = now.getFullYear()
    let nextBday = new Date(currentYear, month - 1, day)
    
    if (nextBday < now) {
        nextBday = new Date(currentYear + 1, month - 1, day)
    }
    
    const diffTime = nextBday.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const isToday = now.getDate() === day && now.getMonth() === month - 1
    
    let text = `🎂 *ʙɪʀᴛʜᴅᴀʏ ɪɴғᴏ*\n\n`
    text += `╭┈┈⬡「 👤 *ᴜsᴇʀ* 」\n`
    text += `┃ 🏷️ @${cleanJid}\n`
    text += `┃ 📅 ${day} ${months[month - 1]}\n`
    
    if (isToday) {
        text += `┃ 🎉 *CUMPLE AÑOS HOY!*\n`
    } else {
        text += `┃ 🕕 Faltan ${diffDays} días\n`
    }
    
    text += `╰┈┈┈┈┈┈┈┈⬡`
    
    if (isToday) {
        text += `\n\n🎊 *FELIZ CUMPLEAÑOS!* 🎊\n`
        text += `> Que tengas larga vida y\n`
        text += `> mucho éxito siempre! 🎉🎂`
    }
    
    await m.reply(text, { mentions: [target] })
}

export { pluginConfig as config, handler }
