const pluginConfig = {
    name: 'cekintrovert',
    alias: ['introvert'],
    category: 'cek',
    description: 'Comprueba tu nivel de introversion',
    usage: '.cekintrovert <nombre>',
    example: '.cekintrovert Budi',
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
    if (percent >= 90) desc = 'La casa es el paraiso! Stay home~ 🏠'
    else if (percent >= 70) desc = 'Bateria social limitada 🔋'
    else if (percent >= 50) desc = 'Ambivertido, equilibrado~ ⚖️'
    else if (percent >= 30) desc = 'Bastante social 🦋'
    else desc = 'Modo extrovertido ON! 🎉'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de introversion es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de introversion de @${mentioned.split('@')[0]} verdad?
    
Su nivel de introversion es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }