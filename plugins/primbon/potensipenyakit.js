import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'potensipenyakit',
    alias: ['cekpenyakit', 'penyakit'],
    category: 'primbon',
    description: 'Consulta el potencial de enfermedad según la fecha de nacimiento',
    usage: '.potensipenyakit <día> <mes> <año>',
    example: '.potensipenyakit 12 05 1998',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (m.args.length < 3) {
        return m.reply(`🏥 *POTENCIAL DE ENFERMEDAD*\n\n> Formato: día mes año\n\n\`Ejemplo: ${m.prefix}potensipenyakit 12 05 1998\``)
    }
    
    const [tgl, bln, thn] = m.args
    
    m.react('🏥')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/cek_potensi_penyakit?tgl=${tgl}&bln=${bln}&thn=${thn}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ERROR*\n\n> No se pudo analizar`)
        }
        
        const result = data.data
        const response = `🏥 *POTENCIAL DE ENFERMEDAD*\n\n` +
            `> Fecha: *${tgl}-${bln}-${thn}*\n\n` +
            `📊 *ELEMENTO:*\n${result.sektor}\n\n` +
            `⚠️ *POTENCIAL:*\n${result.elemen}\n\n` +
            `> _${result.catatan}_`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
