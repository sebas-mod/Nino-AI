import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'antiswgc',
    alias: ['antiswgroup', 'antiswmentiongc', 'antiswtaggc'],
    category: 'group',
    description: 'Detecta menciones de estado o menciones SW que entran al grupo',
    usage: '.antiswgc <on/off>',
    example: '.antiswgc on',
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

async function handler(m, { db }) {
    const action = (m.args || [])[0]?.toLowerCase()
    const group = db.getGroup(m.chat) || {}

    if (!action) {
        const status = group.antiswgc || 'off'
        await m.reply(
            `📡 *ᴀɴᴛɪsᴡɢᴄ*\n\n` +
            `> Estado: *${status === 'on' ? '✅ Aktif' : '❌ Nonactivo'}*\n\n` +
            `> Fitur ini mendeteksi tipe SW group mention seperti:\n` +
            `> • groupStatusMentionMessage\n` +
            `> • groupMentionedMessage\n` +
            `> • statusMentionMessage\n` +
            `> • contextInfo.groupMentions\n\n` +
            `> \`${m.prefix}antiswgc on\`\n` +
            `> \`${m.prefix}antiswgc off\``
        )
        return
    }

    if (action === 'on') {
        db.setGroup(m.chat, { ...group, antiswgc: 'on' })
        await m.reply('✅ *AntiSWGC activo*\n\n> Las menciones SW de grupo se eliminaran automaticamente.')
        return
    }

    if (action === 'off') {
        db.setGroup(m.chat, { ...group, antiswgc: 'off' })
        await m.reply('❌ *AntiSWGC nonactivo*')
        return
    }

    await m.reply('❌ Usa: on o off')
}

export { pluginConfig as config, handler }
