import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'setrulesgrup',
    alias: ['setgrouprules', 'setaturangrup'],
    category: 'group',
    description: 'Establece reglas personalizadas del grupo (solo admins)',
    usage: '.setrulesgrup <text>',
    example: '.setrulesgrup 1. Jangan spam\n2. Hormati sesama',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const text = m.text?.trim() || (m.quoted?.body || m.quoted?.text || '')
    
    if (!text) {
        return m.reply(
            `📝 *sᴇᴛ ɢʀᴜᴘ ʀᴜʟᴇs*\n\n` +
            `> Ingresa teks rules yang baru\n\n` +
            `\`Ejemplo:\`\n` +
            `\`${m.prefix}setrulesgrup 1. Jangan spam\\n2. Hormati sesama\``
        )
    }
    
    db.setGroup(m.chat, { groupRules: text })
    
    m.reply(
        `✅ *ɢʀᴜᴘ ʀᴜʟᴇs ᴅɪᴜᴘᴅᴀᴛᴇ*\n\n` +
        `Rules grupo correctamente diubah!\n` +
        `Escribe \`${m.prefix}rulesgrup\` para ver.`
    )
}

export { pluginConfig as config, handler }
