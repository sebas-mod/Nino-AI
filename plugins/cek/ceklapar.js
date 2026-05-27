const pluginConfig = {
    name: 'ceklapar',
    alias: ['lapar', 'hungry'],
    category: 'cek',
    description: 'Comprueba tu nivel de hambre',
    usage: '.ceklapar <nombre>',
    example: '.ceklapar Budi',
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
    if (percent >= 90) desc = 'HAMBREEE! Come ahora! 🍔🍕🍜'
    else if (percent >= 70) desc = 'El estomago ruge~ 😋'
    else if (percent >= 50) desc = 'Puedes picar algo 🍿'
    else if (percent >= 30) desc = 'Todavia lleno 😊'
    else desc = 'Demasiado lleno! 🤰'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de hambre es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de hambre de @${mentioned.split('@')[0]} verdad?
    
Su nivel de hambre es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }