const pluginConfig = {
    name: 'cekjomblo',
    alias: ['jomblo', 'single'],
    category: 'cek',
    description: 'Comprueba tu nivel de solteria',
    usage: '.cekjomblo <nombre>',
    example: '.cekjomblo Budi',
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
    if (percent >= 90) desc = 'Soltero eterno! Single is happiness~ 💔😎'
    else if (percent >= 70) desc = 'Persona fuerte e independiente! 💪'
    else if (percent >= 50) desc = 'Modo conquista ON 😍'
    else if (percent >= 30) desc = 'Parece que alguien esta interesado~ 👀'
    else desc = 'Pronto con pareja! 💕'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de solteria es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de solteria de @${mentioned.split('@')[0]} verdad?
    
Su nivel de solteria es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }