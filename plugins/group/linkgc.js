import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'linkgc',
    alias: ['linkgrup', 'getlink', 'gclink'],
    category: 'group',
    description: 'Obtiene el enlace de invitacion del grupo',
    usage: '.linkgc',
    example: '.linkgc',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    m.react('🕕')
    
    try {
        const code = await sock.groupInviteCode(m.chat)
        const urlGrupo = `https://chat.whatsapp.com/${code}`
        await m.reply(`Enlace del grupo grupo ini\n${urlGrupo}`)
        
        m.react('✅')
        
    } catch (err) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }