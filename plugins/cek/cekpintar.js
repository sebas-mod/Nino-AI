const pluginConfig = {
    name: 'cekpintar',
    alias: ['pintar', 'iq', 'smart'],
    category: 'cek',
    description: 'Comprueba que tan inteligente eres',
    usage: '.cekpintar <nombre>',
    example: '.cekpintar Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
        const mentioned = m.mentionedJid[0] || m.sender

        const iq = Math.floor(Math.random() * 100) + 70
    
    let desc = ''
    if (iq >= 150) {
        desc = 'GENIO! Nivel Einstein! 🧠✨'
    } else if (iq >= 130) {
        desc = 'Muy inteligente! 🎓'
    } else if (iq >= 110) {
        desc = 'Por encima del promedio! 👍'
    } else if (iq >= 90) {
        desc = 'Normal, promedio 😊'
    } else {
        desc = 'Sigue estudiando con ganas! 📚'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu inteligencia (IQ) es *${iq}*
\`\`\`${desc}\`\`\`` : `Quieres comprobar la inteligencia de @${mentioned.split('@')[0]} verdad?
    
Su inteligencia (IQ) es *${iq}*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }