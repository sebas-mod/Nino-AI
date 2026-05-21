import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'githubstalk',
    alias: ['ghstalk', 'stalkgh'],
    category: 'stalker',
    description: 'Buscar cuenta de GitHub',
    usage: '.githubstalk <usuario>',
    example: '.githubstalk torvalds',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const username = m.args[0]
    
    if (!username) {
        return m.reply(`🐙 *ɢɪᴛʜᴜʙ sᴛᴀʟᴋ*\n\n> Ingresa el nombre de usuario de GitHub\n\n\`Ejemplo: ${m.prefix}githubstalk torvalds\``)
    }
    
    m.react('🔍')
    
    try {
        const res = await axios.get(`https://api.baguss.xyz/api/stalker/github?username=${encodeURIComponent(username)}`, {
            timeout: 30000
        })
        
        if (!res.data?.status) {
            m.react('❌')
            return m.reply(`❌ Usuario *${username}* no encontrado`)
        }
        
        const d = res.data
        
        const caption = `🐙 *ɢɪᴛʜᴜʙ sᴛᴀʟᴋ*\n\n` +
            `👤 *Usuario:* ${d.username}\n` +
            `📛 *Nombre:* ${d.nickname || '-'}\n` +
            `🏢 *Empresa:* ${d.company || '-'}\n` +
            `📍 *Ubicacion:* ${d.location || '-'}\n\n` +
            `📦 *Repos publicos:* ${d.public_repo}\n` +
            `👥 *Seguidores:* ${d.followers}\n` +
            `👤 *Siguiendo:* ${d.following}\n\n` +
            `📝 *Biografia:*\n${d.bio || '-'}\n\n` +
            `🔗 ${d.url}`
        
        m.react('✅')
        
        await sock.sendMessage(m.chat, {
            image: { url: d.profile_pic },
            caption
        }, { quoted: m })
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
