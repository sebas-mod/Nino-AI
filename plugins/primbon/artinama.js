import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'artinama',
    alias: ['namameaning', 'artinamaku'],
    category: 'primbon',
    description: 'Consulta el significado del nombre según primbon',
    usage: '.artinama <nombre>',
    example: '.artinama putu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const nama = m.args.join(' ')
    if (!nama) {
        return m.reply(`📛 *SIGNIFICADO DEL NOMBRE*\n\n> Ingresa un nombre\n\n\`Ejemplo: ${m.prefix}artinama putu\``)
    }
    
    m.react('📛')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/artinama?nama=${encodeURIComponent(nama)}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ERROR*\n\n> No se pudo analizar el nombre`)
        }
        
        const result = data.data
        const response = `📛 *SIGNIFICADO DEL NOMBRE*\n\n` +
            `> Nombre: *${result.nama}*\n\n` +
            `${result.arti}\n\n` +
            `> _${result.catatan}_`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
