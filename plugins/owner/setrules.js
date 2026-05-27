import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'setrules',
    alias: ['setbotrules', 'setaturanbot'],
    category: 'owner',
    description: 'Configurar reglas personalizadas del bot',
    usage: '.setrules <text>',
    example: '.setrules 1. No hagas spam\n2. Respeta a los demas',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const text = m.text?.trim() || (m.quoted?.body || m.quoted?.text || '')
    
    if (!text) {
        return m.reply(
            `📝 *sᴇᴛ ʙᴏᴛ ʀᴜʟᴇs*\n\n` +
            `> Ingresa el nuevo texto de reglas\n\n` +
            `\`Ejemplo:\`\n` +
            `\`${m.prefix}setrules 1. No hagas spam\\n2. Respeta a los demas\``
        )
    }
    
    db.setting('botRules', text)
    
    m.reply(
        `✅ *ʙᴏᴛ ʀᴜʟᴇs ᴅɪᴜᴘᴅᴀᴛᴇ*\n\n` +
        `> Reglas del bot cambiadas correctamente!\n` +
        `> Escribe \`${m.prefix}rules\` para ver.`
    )
}

export { pluginConfig as config, handler }