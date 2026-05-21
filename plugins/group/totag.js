import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'totag',
    alias: ['tagall2', 'mentionall'],
    category: 'group',
    description: 'Etiqueta a todos los miembros con un mensaje respondido',
    usage: '.totag (reply mensaje)',
    example: '.totag',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    if (!m.quoted) {
        return m.reply(
            `📢 *ᴛᴏᴛᴀɢ*\n\n` +
            `> Reply mensaje yang ingin di-forward ke semua miembro\n\n` +
            `> Ejemplo: Reply mensaje lalu ketik \`${m.prefix}totag\``
        )
    }
    
    m.react('📢')
    
    try {
        const participants = m.groupMembers || []
        
        if (!participants || participants.length === 0) {
            return m.reply(`❌ Fallido mendapatkan data miembro grupo`)
        }
        
        const users = participants
            .map(u => u.id || u.jid || u)
            .filter(v => v && v !== sock.user?.jid && v !== sock.user?.id)
        
        await sock.sendMessage(m.chat, {
            forward: m.quoted.fakeObj || m.quoted,
            mentions: users
        })
        
        m.react('✅')
        
    } catch (err) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }