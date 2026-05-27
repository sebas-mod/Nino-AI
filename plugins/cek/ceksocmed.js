const pluginConfig = {
    name: 'ceksocmed',
    alias: ['sosmed', 'medsos'],
    category: 'cek',
    description: 'Comprueba tu nivel de adiccion a redes sociales',
    usage: '.ceksocmed <nombre>',
    example: '.ceksocmed Budi',
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
    if (percent >= 90) desc = 'Adiccion fuerte! Necesitas detox! 📱💀'
    else if (percent >= 70) desc = 'Scrollea sin parar~ 📲'
    else if (percent >= 50) desc = 'Uso normal 👍'
    else if (percent >= 30) desc = 'Bastante saludable 🌿'
    else desc = 'Maestro del detox digital! 🧘'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de redes sociales es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de redes sociales de @${mentioned.split('@')[0]} verdad?
    
Su nivel de redes sociales es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }