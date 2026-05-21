import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'resetlinkgc',
    alias: ['resetlink', 'revokelink', 'newlink'],
    category: 'group',
    description: 'Restablece el enlace de invitacion del grupo',
    usage: '.resetlinkgc',
    example: '.resetlinkgc',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    m.react('🔄')
    
    try {
        await sock.groupRevokeInvite(m.chat)
        
        m.react('✅')
        m.reply(`✅ *ʟɪɴᴋ ɢʀᴜᴘ ᴅɪʀᴇsᴇᴛ*\nEnlace del grupo lama ya tidak berlaku.\nUsa \`${m.prefix}linkgc\` para obtener un enlace nuevo.`)
        
    } catch (err) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }