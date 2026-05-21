import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'igstalk',
    alias: ['instagramstalk', 'stalking'],
    category: 'stalker',
    description: 'Buscar cuenta de Instagram',
    usage: '.igstalk <usuario>',
    example: '.igstalk cristiano',
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
    if (num >= 1_000_000_000)
        return (num / 1_000_000_000).toFixed(1).replace('.0', '') + ' miliar'
    if (num >= 1_000_000)
        return (num / 1_000_000).toFixed(1).replace('.0', '') + ' jt'
    if (num >= 1_000)
        return (num / 1_000).toFixed(1).replace('.0', '') + ' rb'
    return num.toString()
}

async function handler(m, { sock }) {
    const username = m.args[0]?.replace('@', '')
    
    if (!username) {
        return m.reply(
            `📸 *ɪɴsᴛᴀɢʀᴀᴍ sᴛᴀʟᴋ*\n\n` +
            `> Ingresa el nombre de usuario de Instagram\n\n` +
            `\`Ejemplo: ${m.prefix}igstalk cristiano\``
        )
    }
    
    m.react('🔍')
    
    try {
        const res = await axios.post(
            'https://api.boostfluence.com/api/instagram-profile-v2',
            { username },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                },
                timeout: 30000
            }
        )
        
        const d = res.data
        if (!d?.username) {
            m.react('❌')
            return m.reply(`❌ Cuenta *@${username}* no encontrada`)
        }
        
        const caption = `📸 *ɪɴsᴛᴀɢʀᴀᴍ sᴛᴀʟᴋ*\n\n` +
            `👤 *Usuario:* ${d.username}\n` +
            `📛 *Nombre:* ${d.full_name || '-'}\n` +
            `✅ *Verificado:* ${d.is_verified ? 'Si' : 'No'}\n` +
            `🔒 *Privado:* ${d.is_private ? 'Si' : 'No'}\n\n` +
            `👥 *Pengikut:* ${shortNum(d.follower_count)}\n` +
            `👤 *Siguiendo:* ${shortNum(d.following_count)}\n` +
            `📷 *Postingan:* ${shortNum(d.media_count)}\n\n` +
            `📝 *Biografia:*\n${d.biography || '-'}\n\n` +
            `🔗 https://instagram.com/${d.username}`
        
        m.react('✅')
        
        const profilePic = d.profile_pic_url_hd || d.profile_pic_url
        if (profilePic) {
            await sock.sendMessage(m.chat, {
                image: { url: profilePic },
                caption
            }, { quoted: m })
        } else {
            await m.reply(caption)
        }
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
