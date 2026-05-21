/**
 * Soul Match / Belahan Jiwa - Fun compatibility checker
 * Ported from RTXZY-MD-pro
 */

const pluginConfig = {
    name: 'soulmatch',
    alias: [],
    category: 'fun',
    description: 'Revisa la compatibilidad de alma con alguien',
    usage: '.soulmatch nama1|nama2',
    example: '.soulmatch Raiden|Mei',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

const ELEMENTS = ['Fuego 🔥', 'Agua 💧', 'Tierra 🌍', 'Viento 🌪️', 'Rayo ⚡', 'Hielo ❄️', 'Luz ✨', 'Sombra 🌑']
const ZODIAC = ['♈ Aries', '♉ Tauro', '♊ Geminis', '♋ Cancer', '♌ Leo', '♍ Virgo', 
               '♎ Libra', '♏ Escorpio', '♐ Sagitario', '♑ Capricornio', '♒ Acuario', '♓ Piscis']
const SOUL_TYPES = [
    "Lider valiente", "Equilibrador sabio", "Creador expresivo", "Constructor solido", 
    "Aventurero libre", "Protector leal", "Pensador mistico", "Conquistador fuerte", "Humanitario puro"
]

function generateSoulData(name, seed) {
    const nameVal = Array.from(name.toLowerCase()).reduce((a, c) => a + c.charCodeAt(0), 0)
    return {
        element: ELEMENTS[(nameVal + seed) % ELEMENTS.length],
        zodiac: ZODIAC[(nameVal + seed * 2) % ZODIAC.length],
        soulType: SOUL_TYPES[(nameVal + seed * 3) % SOUL_TYPES.length]
    }
}

function getMatchDescription(score) {
    if (score >= 90) return "💫 Destino verdadero"
    if (score >= 80) return "✨ Armonia perfecta"
    if (score >= 70) return "🌟 Conexion fuerte"
    if (score >= 60) return "⭐ Buen potencial"
    if (score >= 50) return "🌙 Requiere esfuerzo"
    return "🌑 Desafio dificil"
}

function getReading(score) {
    if (score >= 80) {
        return "Sus almas tienen una conexion muy especial y rara. El destino planeo este encuentro."
    } else if (score >= 60) {
        return "Hay una quimica fuerte entre ustedes. Sus diferencias crean armonia."
    } else if (score >= 40) {
        return "Necesitan tiempo para entenderse. Cada desafio fortalecera su vinculo."
    }
    return "Hay diferencias significativas en la energia del alma. Hace falta mucha adaptacion y comprension."
}

async function handler(m, { sock }) {
    const args = m.args || []
    const text = args.join(' ')
    
    if (!text || !text.includes('|')) {
        return m.reply(
            `💫 *sᴏᴜʟ ᴍᴀᴛᴄʜ*\n\n` +
            `> Revisa la compatibilidad de alma de 2 personas!\n\n` +
            `*Format:*\n` +
            `> \`.soulmatch nama1|nama2\`\n\n` +
            `*Ejemplo:*\n` +
            `> \`.soulmatch Raiden|Mei\``
        )
    }
    
    const [nama1, nama2] = text.split('|').map(n => n.trim())
    
    if (!nama1 || !nama2) {
        return m.reply(`❌ Ingresa 2 nombres con el formato: \`${m.prefix}soulmatch nombre1|nombre2\``)
    }
    
    await m.react('🕕')
    
    const seed1 = Date.now() % 100
    const seed2 = (Date.now() + 50) % 100
    const soul1 = generateSoulData(nama1, seed1)
    const soul2 = generateSoulData(nama2, seed2)
    const combined = nama1.toLowerCase() + nama2.toLowerCase()
    const baseScore = Array.from(combined).reduce((a, c) => a + c.charCodeAt(0), 0)
    const compatibility = (baseScore % 51) + 50 
    let txt = `╭═══❯ *💫 COMPATIBILIDAD DE ALMAS* ❮═══\n`
    txt += `│\n`
    txt += `│ 👤 *${nama1}*\n`
    txt += `│ ├ 🔮 Alma: ${soul1.soulType}\n`
    txt += `│ ├ 🌟 Elemento: ${soul1.element}\n`
    txt += `│ └ 🎯 Zodiaco: ${soul1.zodiac}\n`
    txt += `│\n`
    txt += `│ 👤 *${nama2}*\n`
    txt += `│ ├ 🔮 Alma: ${soul2.soulType}\n`
    txt += `│ ├ 🌟 Elemento: ${soul2.element}\n`
    txt += `│ └ 🎯 Zodiaco: ${soul2.zodiac}\n`
    txt += `│\n`
    txt += `│ 💕 *COMPATIBILIDAD*\n`
    txt += `│ ├ 📊 Puntaje: *${compatibility}%*\n`
    txt += `│ └ 🎭 Estado: ${getMatchDescription(compatibility)}\n`
    txt += `│\n`
    txt += `│ 🔮 *Lectura:*\n`
    txt += `│ ${getReading(compatibility)}\n`
    txt += `│\n`
    txt += `╰════════════════════`
    await m.reply(txt)
    m.react('✅')
}

export { pluginConfig as config, handler }
