import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'nomerhoki',
    alias: ['nomorhoki', 'ceknomor'],
    category: 'primbon',
    description: 'Consulta la suerte de un número de celular',
    usage: '.nomerhoki <número>',
    example: '.nomerhoki 6281234567890',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let nomor = m.args.join('').replace(/[^0-9]/g, '')
    if (!nomor) {
        return m.reply(`🍀 *NÚMERO DE SUERTE*\n\n> Ingresa un número de celular\n\n\`Ejemplo: ${m.prefix}nomerhoki 6281234567890\``)
    }
    
    m.react('🍀')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/nomorhoki?phoneNumber=${nomor}`
        const { data } = await axios.get(url, { timeout: 30000 })
        
        if (!data?.status || !data?.data) {
            m.react('❌')
            return m.reply(`❌ *ERROR*\n\n> No se pudo analizar el número`)
        }
        
        const r = data.data
        const ep = r.energi_positif.details
        const en = r.energi_negatif.details
        
        const response = `🍀 *NÚMERO DE SUERTE*\n\n` +
            `> Número: *${r.nomor}*\n\n` +
            `📊 *NÚMERO BAGUA:* ${r.angka_bagua_shuzi.value}%\n\n` +
            `✅ *ENERGÍA POSITIVA:* ${r.energi_positif.total}%\n` +
            `├ Riqueza: ${ep.kekayaan}\n` +
            `├ Salud: ${ep.kesehatan}\n` +
            `├ Amor: ${ep.cinta}\n` +
            `└ Estabilidad: ${ep.kestabilan}\n\n` +
            `❌ *ENERGÍA NEGATIVA:* ${r.energi_negatif.total}%\n` +
            `├ Disputas: ${en.perselisihan}\n` +
            `├ Pérdida: ${en.kehilangan}\n` +
            `├ Desgracia: ${en.malapetaka}\n` +
            `└ Destrucción: ${en.kehancuran}\n\n` +
            `> Estado: ${r.analisis.status ? '✅ CON SUERTE' : '❌ SIN SUERTE'}`
        
        m.react('✅')
        await m.reply(response)
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
