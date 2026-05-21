import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'mangatoon',
    alias: ['mtoon', 'mangatoonsearch', 'searchmangatoon'],
    category: 'search',
    description: 'Buscar cómics en Mangatoon',
    usage: '.mangatoon <query>',
    example: '.mangatoon love',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 8,
    energi: 1,
    isEnabled: true
}

const CUKI_APIKEY = config.APIkey?.cuki || 'cuki-x'

function trimText(text, max = 60) {
    const value = (text || '').replace(/\s+/g, ' ').trim()
    if (!value) return '-'
    if (value.length <= max) return value
    return value.slice(0, max) + '...'
}

async function fetchMangatoon(query) {
    const { data } = await axios.get(`https://api.cuki.biz.id/api/search/mangatoon?apikey=${encodeURIComponent(CUKI_APIKEY)}&query=${encodeURIComponent(query)}`, {
        timeout: 30000,
        headers: {
            'x-api-key': CUKI_APIKEY,
            'user-agent': 'Mozilla/5.0'
        }
    })

    if (!data?.status || !data?.data?.results) {
        throw new Error(data?.message || 'No se encontraron resultados de Mangatoon')
    }

    return data.data
}

async function handler(m, { sock }) {
    const query = m.text?.trim()

    if (!query) {
        return m.reply(`📚 *BÚSQUEDA MANGATOON*\n\n> Ejemplo:\n\`${m.prefix}mangatoon love\``)
    }

    m.react('🔍')

    try {
        const result = await fetchMangatoon(query)
        const komikGroups = Array.isArray(result.results?.komik) ? result.results.komik : []
        const items = komikGroups.flatMap((entry) => Array.isArray(entry?.items) ? entry.items : []).slice(0, 10)

        if (items.length === 0) {
            m.react('❌')
            return m.reply(`❌ No se encontraron cómics de Mangatoon para: ${query}`)
        }

        let caption = '📚 *BÚSQUEDA MANGATOON*\n\n'
        caption += `🔎 *Búsqueda:* ${result.query || query}\n`
        caption += `📦 *Total:* ${result.total || items.length}\n`
        caption += `🌐 *Fuente:* ${result.source || 'mangatoon.mobi'}\n\n`

        items.forEach((item, index) => {
            caption += `*${index + 1}.* ${trimText(item.title)}\n`
            caption += `   ├ ${item.link}\n\n`
        })

        const cover = items[0]?.image
        if (cover) {
            await sock.sendMedia(m.chat, cover, caption.trim(), m, {
                type: 'image'
            })
        } else {
            await m.reply(caption.trim())
        }

        m.react('✅')
    } catch (error) {
        console.log(error)
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
