const pluginConfig = {
    name: 'cekoverpower',
    alias: ['overpower', 'op'],
    category: 'cek',
    description: 'Comprueba tu nivel overpower',
    usage: '.cekoverpower <nombre>',
    example: '.cekoverpower Budi',
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
    if (percent >= 90) desc = 'MUY OVERPOWER! LEYENDA! 👑🔥'
    else if (percent >= 70) desc = 'Muy fuerte! 💪'
    else if (percent >= 50) desc = 'Bastante fuerte~ 😎'
    else if (percent >= 30) desc = 'Bastante normal 🤔'
    else desc = 'Todavia necesita practica 📝'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel overpower es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel overpower de @${mentioned.split('@')[0]} verdad?
    
Su nivel overpower es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }