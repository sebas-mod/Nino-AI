import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'zodiak',
    alias: ['horoscope', 'ramalan'],
    category: 'primbon',
    description: 'Predicción del zodiaco',
    usage: '.zodiak <nombre del zodiaco>',
    example: '.zodiak aries',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const validZodiacs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagitarius', 'capricorn', 'aquarius', 'pisces']

async function handler(m, { sock }) {
    const zodiac = m.args[0]?.toLowerCase()
    
    if (!zodiac || !validZodiacs.includes(zodiac)) {
        return m.reply(`⭐ *ZODIACO*\n\n> Ingresa el nombre del zodiaco:\n\n${validZodiacs.map(z => `• ${z}`).join('\n')}\n\n\`Ejemplo: ${m.prefix}zodiak aries\``)
    }
    
    m.react('⭐')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/zodiak?zodiak=${zodiac}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ERROR*\n\n> No se pudo obtener la predicción`)
        }
        
        const r = data.data
        const response = `⭐ *ZODIACO ${zodiac.toUpperCase()}*\n\n` +
            `${r.zodiak}\n\n` +
            `🔢 *NÚMERO:* ${r.nomor_keberuntungan}\n` +
            `🌸 *FLOR:* ${r.bunga_keberuntungan}\n` +
            `🎨 *COLOR:* ${r.warna_keberuntungan}\n` +
            `💎 *PIEDRA:* ${r.batu_keberuntungan}\n` +
            `🔥 *ELEMENTO:* ${r.elemen_keberuntungan}\n` +
            `🪐 *PLANETA:* ${r.planet_yang_mengitari}\n` +
            `💕 *PAREJA:* ${r.pasangan_zodiak}`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
