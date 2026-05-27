const pluginConfig = {
    name: 'cekkpopers',
    alias: ['kpopers', 'kpop'],
    category: 'cek',
    description: 'Comprueba tu nivel de fan del K-pop',
    usage: '.cekkpopers <nombre>',
    example: '.cekkpopers Budi',
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
    if (percent >= 90) desc = 'ARMY/BLINK nivel maximo! 💜💗'
    else if (percent >= 70) desc = 'Fan intenso! 🎤'
    else if (percent >= 50) desc = 'Oyente casual~ 🎵'
    else if (percent >= 30) desc = 'Solo sabes un poco 😅'
    else desc = 'No es fan del K-pop 🤷'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de fan del K-pop es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de fan del K-pop de @${mentioned.split('@')[0]} verdad?
    
Su nivel de fan del K-pop es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }