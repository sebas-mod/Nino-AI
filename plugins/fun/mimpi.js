/**
 * Mimpi / Dream World - Fun dream interpretation generator
 * Ported from RTXZY-MD-pro
 */

const pluginConfig = {
    name: 'mimpi',
    alias: ['dream', 'dreamworld'],
    category: 'fun',
    description: 'Explora tu mundo de suenos segun un nombre',
    usage: '.mimpi <nombre>',
    example: '.mimpi Keisya',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

const DREAM_LEVELS = ['Lucido ✨', 'Mistico 🌟', 'Etereo 💫', 'Divino 🌙', 'Legendario 🎇']
const DREAM_QUALITIES = ['Pacifico 😌', 'Aventura 🚀', 'Mistico 🔮', 'Profecia 📖', 'Epico 🗺️']

const ELEMENTS = [
    '🌊 Oceano de cristal brillante',
    '🌈 Arcoiris flotante',
    '🌺 Jardin flotante',
    '⭐ Constelacion viviente',
    '🌙 Lunas gemelas',
    '🏰 Castillo de nubes',
    '🌋 Montana prisma',
    '🎭 Teatro de sombras'
]

const EVENTS = [
    '🦋 Mariposas llevan un mensaje secreto',
    '🎭 Mascaras bailan solas',
    '🌊 Una lluvia de estrellas cae al mar',
    '🎪 Desfile de criaturas magicas',
    '🌺 Flores cantan una cancion antigua',
    '🎨 Pinturas cobran vida',
    '🎵 La musica se ve como colores',
    '⚡ Un rayo forma una escalera al cielo'
]

const ENCOUNTERS = [
    '🐉 Dragon arcoiris sabio',
    '🧙‍♂️ Hechicero estelar',
    '🦊 Zorro espiritual de nueve colas',
    '🧝‍♀️ Hada portadora de suenos',
    '🦁 Leon de cristal',
    '🐋 Ballena voladora mistica',
    '🦅 Fenix del tiempo',
    '🐢 Tortuga portadora de mundos',
    '🦄 Unicornio dimensional'
]

const POWERS = [
    '✨ Controlar el tiempo',
    '🌊 Hablar con los elementos',
    '🎭 Cambiar de forma',
    '🌈 Manipular la realidad',
    '👁️ Vision del futuro',
    '🎪 Teletransportacion dimensional',
    '🌙 Sanacion espiritual',
    '⚡ Energia cosmica'
]

const MESSAGES = [
    'Tu viaje traera grandes cambios',
    'Un secreto antiguo se revelara pronto',
    'Un poder oculto despertara pronto',
    'Un nuevo destino espera en el horizonte',
    'La conexion espiritual se fortalecera',
    'Ocurrira una gran transformacion',
    'La claridad llegara desde una direccion inesperada',
    'Una mision importante comenzara pronto'
]

function generateDream(seed) {
    const seedNum = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    const pick = (arr) => arr[seedNum % arr.length]
    const pickMulti = (arr, count) => {
        const shuffled = [...arr].sort(() => Math.random() - 0.5)
        return shuffled.slice(0, count)
    }
    
    return {
        level: pick(DREAM_LEVELS),
        quality: pick(DREAM_QUALITIES),
        elements: pickMulti(ELEMENTS, 3),
        events: pickMulti(EVENTS, 2),
        encounters: pickMulti(ENCOUNTERS, 2),
        powers: pickMulti(POWERS, 2),
        message: pick(MESSAGES)
    }
}

async function handler(m, { sock }) {
    const args = m.args || []
    let name = args.join(' ') || m.pushName || m.sender.split('@')[0]
    
    await m.react('🌙')
    await m.reply('🌙 *Entrando al mundo de los suenos...*')
    await new Promise(r => setTimeout(r, 1500))
    
    const dream = generateDream(name)
    
    let txt = `╭═══❯ *🌙 MUNDO DE SUENOS* ❮═══\n`
    txt += `│ 👤 *Explorador:* ${name}\n`
    txt += `│ ⭐ *Nivel:* ${dream.level}\n`
    txt += `│ 💫 *Calidad:* ${dream.quality}\n`
    txt += `│ 🌈 *Elementos:*\n`
    for (const el of dream.elements) {
        txt += `│ ├ ${el}\n`
    }
    txt += `│ 🎪 *Eventos:*\n`
    for (const ev of dream.events) {
        txt += `│ ├ ${ev}\n`
    }
    txt += `│ 🌟 *Encuentros:*\n`
    for (const enc of dream.encounters) {
        txt += `│ ├ ${enc}\n`
    }
    txt += `│ 💫 *Poderes:*\n`
    for (const pow of dream.powers) {
        txt += `│ ├ ${pow}\n`
    }
    txt += `│ 🔮 *Mensaje:*\n`
    txt += `│ ${dream.message}\n`
    txt += `╰════════════════════`
    
    await m.reply(txt)
}

export { pluginConfig as config, handler }
