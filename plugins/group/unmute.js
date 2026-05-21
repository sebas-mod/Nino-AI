import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'unmute',
    alias: ['unbisukan'],
    category: 'group',
    description: 'Quita el silencio del grupo',
    usage: '.unmute',
    example: '.unmute',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const group = db.getGroup(m.chat) || {}
    const groupName = m.groupMetadata.subject

    if (!group.mute) return m.reply('❌ Grupo tidak sedang di-mute.')

    db.setGroup(m.chat, { ...group, mute: false })
    m.reply(`✅ Grupo *${groupName}* correctamente di-unmute oleh @${m.sender.split('@')[0]}\n\nTodos miembro sekarang bisa enviar mensaje.`, { mentions: [m.sender] })
}

export { pluginConfig as config, handler }