import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'mute',
    alias: ['bisukan'],
    category: 'group',
    description: 'Silencia todo el grupo (solo admins pueden enviar mensajes)',
    usage: '.mute',
    example: '.mute',
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

    if (group.mute) return m.reply('❌ Grupo ya en keadaan mute.')

    db.setGroup(m.chat, { ...group, mute: true })
    m.reply(`✅ Grupo *${groupName}* correctamente di-mute oleh @${m.sender.split('@')[0]}\n\nSolo admins pueden enviar mensajes.\nEscribe *${m.prefix}unmute* para membuka kembali.`, { mentions: [m.sender] })
}

function isMuted(groupJid, db) {
    const group = db.getGroup(groupJid) || {}
    return !!group.mute
}

export { pluginConfig as config, handler, isMuted }