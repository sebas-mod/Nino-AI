import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'autoreactsw',
    alias: ['autoreaksi', 'reactsw', 'autoreactstory'],
    category: 'owner',
    description: 'Reaccionar automaticamente a todos los estados/historias de WA',
    usage: '.autoreactsw on/off [emoji]',
    example: '.autoreactsw on 🔥',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const args = m.args || []
    const action = (args[0] || '').toLowerCase()
    const emoji = args[1] || '🔥'

    const current = db.setting('autoReactSW') || { enabled: false, emoji: '🔥' }

    if (!action) {
        return m.reply(
            `👁️ *ᴀᴜᴛᴏ ʀᴇᴀᴄᴛ sᴛᴏʀʏ*\n\n` +
            `> Estado: *${current.enabled ? '✅ ON' : '❌ OFF'}*\n` +
            `> Emoji: *${current.emoji}*\n\n` +
            `*ᴍᴏᴅᴏ ᴅᴇ ᴜꜱᴏ:*\n` +
            `> \`${m.prefix}autoreactsw on\` — Activar (emoji default 🔥)\n` +
            `> \`${m.prefix}autoreactsw on 😍\` — Activar con emoji\n` +
            `> \`${m.prefix}autoreactsw off\` — Desactivar`
        )
    }

    if (action === 'on') {
        db.setting('autoReactSW', { enabled: true, emoji })
        db.save()
        await m.react('✅')
        return m.reply(
            `✅ *ᴀᴜᴛᴏ ʀᴇᴀᴄᴛ sᴛᴏʀʏ ᴀᴋᴛɪꜰ*\n\n` +
            `> Emoji: *${emoji}*\n` +
            `> El bot reaccionara automaticamente a todas las stories de WA`
        )
    }

    if (action === 'off') {
        db.setting('autoReactSW', { enabled: false, emoji: current.emoji })
        db.save()
        await m.react('✅')
        return m.reply(`❌ *ᴀᴜᴛᴏ ʀᴇᴀᴄᴛ sᴛᴏʀʏ ᴅɪᴍᴀᴛɪᴋᴀɴ*`)
    }

    return m.reply(`❌ Usa \`on\` o \`off\``)
}

export { pluginConfig as config, handler }
