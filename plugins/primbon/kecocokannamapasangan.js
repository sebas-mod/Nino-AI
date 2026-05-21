import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'kecocokannamapasangan',
    alias: ['cocoknama', 'matchname'],
    category: 'primbon',
    description: 'Consulta la compatibilidad de nombres de pareja',
    usage: '.kecocokannamapasangan <nombre1> <nombre2>',
    example: '.kecocokannamapasangan putu keyla',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (m.args.length < 2) {
        return m.reply(`💕 *COMPATIBILIDAD DE NOMBRES*\n\n> Formato: nombre1 nombre2\n\n\`Ejemplo: ${m.prefix}kecocokannamapasangan putu keyla\``)
    }
    
    const [nama1, nama2] = m.args
    
    m.react('💕')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/kecocokan_nama_pasangan?nama1=${encodeURIComponent(nama1)}&nama2=${encodeURIComponent(nama2)}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ERROR*\n\n> No se pudo analizar`)
        }
        
        const result = data.data
        const response = `💕 *COMPATIBILIDAD DE NOMBRES DE PAREJA*\n\n` +
            `> 👤 ${result.nama_anda}\n` +
            `> 💑 ${result.nama_pasangan}\n\n` +
            `✅ *LADO POSITIVO:*\n${result.sisi_positif}\n\n` +
            `❌ *LADO NEGATIVO:*\n${result.sisi_negatif}\n\n` +
            `> _${result.catatan}_`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
