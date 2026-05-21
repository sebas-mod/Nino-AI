import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'tafsirmimpi',
    alias: ['artimimpi', 'mimpi'],
    category: 'primbon',
    description: 'Busca la interpretación de un sueño',
    usage: '.tafsirmimpi <palabra clave>',
    example: '.tafsirmimpi bertemu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const keyword = m.args.join(' ')
    if (!keyword) {
        return m.reply(`🌙 *INTERPRETACIÓN DE SUEÑOS*\n\n> Ingresa una palabra clave del sueño\n\n\`Ejemplo: ${m.prefix}tafsirmimpi bertemu\``)
    }
    
    m.react('🌙')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/tafsirmimpi?mimpi=${encodeURIComponent(keyword)}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data?.hasil?.length) {
            m.react('❌')
            return m.reply(`❌ *ERROR*\n\n> No se encontró interpretación para: ${keyword}`)
        }
        
        const r = data.data
        let response = `🌙 *INTERPRETACIÓN DE SUEÑOS*\n\n`
        response += `> Palabra clave: *${r.keyword}*\n`
        response += `> Encontrados: *${r.total} resultados*\n\n`
        
        r.hasil.slice(0, 10).forEach((h, i) => {
            response += `*${i+1}. ${h.mimpi}*\n> ${h.tafsir}\n\n`
        })
        
        if (r.total > 10) {
            response += `_...y ${r.total - 10} resultados más_`
        }
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
