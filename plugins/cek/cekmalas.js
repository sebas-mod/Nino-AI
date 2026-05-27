const pluginConfig = {
    name: 'cekmalas',
    alias: ['malas', 'lazy'],
    category: 'cek',
    description: 'Comprueba que tan perezoso eres',
    usage: '.cekmalas <nombre>',
    example: '.cekmalas Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
        const percent = Math.floor(Math.random() * 101)
    const mentioned = m.mentionedJid[0] || m.sender
                    
    let desc = ''
    if (percent >= 90) {
        desc = 'SUPER PEREZOSO! Rey del descanso! 🛏️'
    } else if (percent >= 70) {
        desc = 'Muy perezoso! 😴'
    } else if (percent >= 50) {
        desc = 'Bastante perezoso 🥱'
    } else if (percent >= 30) {
        desc = 'Un poco perezoso 😊'
    } else {
        desc = 'Muy trabajador! 💪'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de pereza es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de pereza de @${mentioned.split('@')[0]} verdad?
    
Su nivel de pereza es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }