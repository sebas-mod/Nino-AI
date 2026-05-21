import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-OurinMD'

const pluginConfig = {
    name: 'robloxplayer',
    alias: ['robloxsearch', 'searchroblox', 'robloxfind'],
    category: 'stalker',
    description: 'Buscar jugador de Roblox por nombre de usuario',
    usage: '.robloxplayer <usuario>',
    example: '.robloxplayer linkmon',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const query = m.text?.trim()
    
    if (!query) {
        return m.reply(
            `🎮 *ʀᴏʙʟᴏx ᴘʟᴀʏᴇʀ sᴇᴀʀᴄʜ*\n\n` +
            `> Ingresa el nombre de usuario para buscar\n\n` +
            `\`${m.prefix}robloxplayer linkmon\``
        )
    }
    
    m.react('🔍')
    
    try {
        const res = await axios.get(`https://api.neoxr.eu/api/roblox-search?q=${encodeURIComponent(query)}&apikey=${NEOXR_APIKEY}`, {
            timeout: 30000
        })
        
        if (!res.data?.status || !res.data?.data?.length) {
            m.react('❌')
            return m.reply(`❌ No se encontro ningun jugador con el nombre de usuario: ${query}`)
        }
        
        const players = res.data.data.slice(0, 10)
        
        let text = `🎮 *ʀᴏʙʟᴏx ᴘʟᴀʏᴇʀ sᴇᴀʀᴄʜ*\n\n`
        text += `> Busqueda: \`${query}\`\n`
        text += `> Encontrados: *${players.length}* jugadores\n\n`
        
        players.forEach((player, i) => {
            text += `╭┈┈⬡「 ${i + 1}. *${player.displayName}* 」\n`
            text += `┃ 🆔 ID: \`${player.id}\`\n`
            text += `┃ 👤 Usuario: \`${player.name}\`\n`
            text += `┃ 📛 Nombre visible: *${player.displayName}*\n`
            text += `┃ ✅ Verificado: ${player.hasVerifiedBadge ? 'Si' : 'No'}\n`
            if (player.previousUsernames?.length > 0) {
                text += `┃ 📜 Anteriores: ${player.previousUsernames.join(', ')}\n`
            }
            text += `╰┈┈⬡\n\n`
        })
        
        text += `> _Usa \`.robloxstalk <usuario>\` para ver informacion detallada_`
        
        await m.reply(text)
        m.react('✅')
        
    } catch (err) {
        console.error('[RobloxPlayer] Error:', err.message)
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
