import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'pintereststalk',
    alias: ['pinstalk', 'stalkpin'],
    category: 'stalker',
    description: 'Buscar cuenta de Pinterest',
    usage: '.pintereststalk <usuario>',
    example: '.pintereststalk shiroko',
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
        return m.reply(`📌 *ᴘɪɴᴛᴇʀᴇsᴛ sᴛᴀʟᴋ*\n\n> Ingresa el nombre de usuario de Pinterest\n\n\`Ejemplo: ${m.prefix}pintereststalk shiroko\``)
    }
    
    m.react('🔍')
    
    try {
        const res = await axios.get(`https://api.baguss.xyz/api/stalker/pinterest?username=${encodeURIComponent(username)}`, {
            timeout: 30000
        })
        
        if (!res.data?.status || !res.data?.user) {
            m.react('❌')
            return m.reply(`❌ Usuario *${username}* no encontrado`)
        }
        
        const u = res.data.user
        const s = u.stats
        
        const caption = `📌 *ᴘɪɴᴛᴇʀᴇsᴛ sᴛᴀʟᴋ*\n\n` +
            `👤 *Usuario:* ${u.username}\n` +
            `📛 *Nombre:* ${u.full_name}\n\n` +
            `📍 *Pins:* ${s.pins}\n` +
            `👥 *Seguidores:* ${s.followers}\n` +
            `👤 *Siguiendo:* ${s.following}\n` +
            `📋 *Tableros:* ${s.boards}\n\n` +
            `📝 *Biografia:*\n${u.bio || '-'}\n\n` +
            `🔗 ${u.profile_url}`
        
        m.react('✅')
        
        const profilePic = u.image?.original || u.image?.large
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
