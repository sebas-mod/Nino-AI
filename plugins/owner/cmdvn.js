import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'cmdvn',
    alias: ['voicecommand', 'vncmd'],
    category: 'owner',
    description: 'Activar command via voice note',
    usage: '.cmdvn <on/off>',
    example: '.cmdvn on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const args = m.args || []
    const subCmd = args[0]?.toLowerCase()

    const current = db.setting('cmdVn') || false

    if (!subCmd || subCmd === 'status') {
        const status = current ? '✅ ON' : '❌ OFF'
        return m.reply(
            `🎤 *ᴄᴍᴅ ᴠᴏɪᴄᴇ ɴᴏᴛᴇ*\n\n` +
            `> Estado: *${status}*\n\n` +
            `> \`${m.prefix}cmdvn on\` — Command via VN\n` +
            `> \`${m.prefix}cmdvn off\` — Command via text (default)\n\n` +
            `> Cuando este ON, envia un VN con el nombre del comando\n` +
            `> Ejemplo: VN "menu" → trigger .menu`
        )
    }

    if (subCmd === 'on') {
        db.setting('cmdVn', true)
        return m.reply(
            `✅ *ᴄᴍᴅ ᴠɴ ᴀᴋᴛɪꜰ*\n\n` +
            `> Envia una nota de voz con el nombre del comando\n` +
            `> El bot transcribira y ejecutara automaticamente\n` +
            `> Ejemplo: VN "menu" → trigger .menu`
        )
    }

    if (subCmd === 'off') {
        db.setting('cmdVn', false)
        return m.reply(`❌ CMD VN *dinonactivokan*. Command via text normal.`)
    }

    return m.reply(`❌ Usa \`${m.prefix}cmdvn on\` o \`${m.prefix}cmdvn off\``)
}

export { pluginConfig as config, handler }