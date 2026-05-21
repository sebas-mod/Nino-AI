import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'tiktokstalk',
    alias: ['ttstalk', 'stalktt'],
    category: 'stalker',
    description: 'Buscar cuenta de TikTok',
    usage: '.tiktokstalk <usuario>',
    example: '.tiktokstalk mrbeast',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

function shortNum(num) {
    if (!num) return '0'
    num = parseInt(num)
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace('.0', '') + 'B'
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace('.0', '') + 'M'
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace('.0', '') + 'K'
    return num.toString()
}

async function handler(m, { sock }) {
    const username = m.args[0]?.replace('@', '')
    
    if (!username) {
        return m.reply(`🎵 *ᴛɪᴋᴛᴏᴋ sᴛᴀʟᴋ*\n\n> Ingresa el nombre de usuario de TikTok\n\n\`Ejemplo: ${m.prefix}tiktokstalk mrbeast\``)
    }
    
    m.react('🔍')
    
    try {
        const res = await axios.get(`https://api.baguss.xyz/api/stalker/tiktok?username=${encodeURIComponent(username)}`, {
            timeout: 30000
        })
        
        if (!res.data?.status || !res.data?.user?.user) {
            m.react('❌')
            return m.reply(`❌ Usuario *@${username}* no encontrado`)
        }
        
        const u = res.data.user.user
        const s = res.data.user.stats
        
        const caption = `🎵 *ᴛɪᴋᴛᴏᴋ sᴛᴀʟᴋ*\n\n` +
            `👤 *Usuario:* @${u.uniqueId}\n` +
            `📛 *Nombre:* ${u.nickname}\n` +
            `✅ *Verificado:* ${u.verified ? 'Si' : 'No'}\n` +
            `🔒 *Privado:* ${u.privateAccount ? 'Si' : 'No'}\n\n` +
            `👥 *Seguidores:* ${shortNum(s.followerCount)}\n` +
            `👤 *Siguiendo:* ${shortNum(s.followingCount)}\n` +
            `❤️ *Me gusta:* ${shortNum(s.heartCount)}\n` +
            `🎬 *Videos:* ${shortNum(s.videoCount)}\n\n` +
            `📝 *Biografia:*\n${u.signature || '-'}\n\n` +
            `🔗 https://tiktok.com/@${u.uniqueId}`
        
        m.react('✅')
        
        await sock.sendMessage(m.chat, {
            image: { url: u.avatarLarger || u.avatarMedium },
            caption
        }, { quoted: m })
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
