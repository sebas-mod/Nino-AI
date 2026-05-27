const pluginConfig = {
    name: 'cekberat',
    alias: ['berat', 'weight'],
    category: 'cek',
    description: 'Comprueba un peso corporal aleatorio',
    usage: '.cekberat <nombre>',
    example: '.cekberat Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const berat = Math.floor(Math.random() * 60) + 40
    const mentioned = m.mentionedJid?.[0] || m.sender
    
    let desc = ''
    if (berat >= 90) {
        desc = 'Grande y fuerte! 💪'
    } else if (berat >= 70) {
        desc = 'Con cuerpo y saludable! 😊'
    } else if (berat >= 55) {
        desc = 'Muy ideal! 👍'
    } else if (berat >= 45) {
        desc = 'Bien delgado~ 🌸'
    } else {
        desc = 'Muy flaco, come mas! 🍔'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu peso corporal es *${berat} kg*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el peso corporal de @${mentioned.split('@')[0]} verdad?
    
Su peso corporal es *${berat} kg*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
