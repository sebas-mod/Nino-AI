import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'antiphising',
    alias: ['antiphishing', 'antiscamlink', 'nophising'],
    category: 'group',
    description: 'Detecta contenido de phishing en el grupo',
    usage: '.antiphising <on/off/metode> [kick/remove]',
    example: '.antiphising on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const option = m.text?.toLowerCase()?.trim()

    if (!option) {
        const status = groupData.antiphising || 'off'
        const mode = groupData.antiphisingMode || 'remove'
        return m.reply(
            `🎣 *ᴀɴᴛɪᴘʜɪsɪɴɢ*\n\n` +
            `> Estado: *${status.toUpperCase()}*\n` +
            `> Mode: *${mode.toUpperCase()}*\n\n` +
            `> Detecta mensajes de phishing como enlaces de clic, verificacion de cuenta, login falso, acortadores sospechosos, URL por IP, punycode y patrones similares.\n\n` +
            `> \`${m.prefix}antiphising on\`\n` +
            `> \`${m.prefix}antiphising off\`\n` +
            `> \`${m.prefix}antiphising metode kick\`\n` +
            `> \`${m.prefix}antiphising metode remove\``
        )
    }

    if (option === 'on') {
        db.setGroup(m.chat, { antiphising: 'on' })
        return m.reply('✅ *AntiPhising activado*')
    }

    if (option === 'off') {
        db.setGroup(m.chat, { antiphising: 'off' })
        return m.reply('❌ *AntiPhising desactivado*')
    }

    if (option.startsWith('metode')) {
        const method = m.args?.[1]?.toLowerCase()
        if (method === 'kick') {
            db.setGroup(m.chat, { antiphising: 'on', antiphisingMode: 'kick' })
            return m.reply('✅ *AntiPhising mode KICK activado*')
        }
        if (method === 'remove' || method === 'delete') {
            db.setGroup(m.chat, { antiphising: 'on', antiphisingMode: 'remove' })
            return m.reply('✅ *AntiPhising mode DELETE activado*')
        }
        return m.reply('❌ Metode no valido! Usa: `kick` o `remove`')
    }

    if (option === 'kick') {
        db.setGroup(m.chat, { antiphising: 'on', antiphisingMode: 'kick' })
        return m.reply('✅ *AntiPhising mode KICK activado*')
    }

    if (option === 'remove' || option === 'delete') {
        db.setGroup(m.chat, { antiphising: 'on', antiphisingMode: 'remove' })
        return m.reply('✅ *AntiPhising mode DELETE activado*')
    }

    return m.reply('❌ Opsi no valido! Usa: `on`, `off`, `metode kick`, `metode remove`')
}

export { pluginConfig as config, handler }
