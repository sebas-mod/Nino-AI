const pluginConfig = {
    name: 'cekjahat',
    alias: ['jahat', 'evil'],
    category: 'cek',
    description: 'Comprueba que tan malvado eres',
    usage: '.cekjahat <nombre>',
    example: '.cekjahat Budi',
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
        desc = 'VILLAIN LEVEL! 😈👿'
    } else if (percent >= 70) {
        desc = 'Muy malvado! 💀'
    } else if (percent >= 50) {
        desc = 'Bastante malvado 😏'
    } else if (percent >= 30) {
        desc = 'Un poco travieso 😊'
    } else {
        desc = 'Bueno, no malvado! 😇'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de maldad es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de maldad de @${mentioned.split('@')[0]} verdad?
    
Su nivel de maldad es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }