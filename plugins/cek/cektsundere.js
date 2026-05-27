const pluginConfig = {
    name: 'cektsundere',
    alias: ['tsundere'],
    category: 'cek',
    description: 'Comprueba tu nivel tsundere',
    usage: '.cektsundere <nombre>',
    example: '.cektsundere Budi',
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
    if (percent >= 90) desc = 'BAKA! N-NO SIGNIFICA QUE ME GUSTES! 😤💢'
    else if (percent >= 70) desc = 'Hmph! No lo malinterpretes! 😳'
    else if (percent >= 50) desc = 'B-bueno, como quieras... 👉👈'
    else if (percent >= 30) desc = 'Un poco tsundere~ 😊'
    else desc = 'No es tsundere, solo sincero 💕'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel tsundere es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel tsundere de @${mentioned.split('@')[0]} verdad?
    
Su nivel tsundere es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }