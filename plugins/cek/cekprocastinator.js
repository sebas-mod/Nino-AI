const pluginConfig = {
    name: 'cekprocastinator',
    alias: ['procrastinator', 'nunda'],
    category: 'cek',
    description: 'Comprueba tu nivel de procrastinacion',
    usage: '.cekprocastinator <nombre>',
    example: '.cekprocastinator Budi',
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
    if (percent >= 90) desc = 'Deadline? Mejor manana~ 😴'
    else if (percent >= 70) desc = 'Maestro de la procrastinacion! 🦥'
    else if (percent >= 50) desc = 'A veces procrastina, a veces trabaja 😅'
    else if (percent >= 30) desc = 'Bastante productivo! 💪'
    else desc = 'Muy disciplinado! Respeto! 🏆'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de procrastinacion es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de procrastinacion de @${mentioned.split('@')[0]} verdad?
    
Su nivel de procrastinacion es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }