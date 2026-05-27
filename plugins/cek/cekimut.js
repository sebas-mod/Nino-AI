const pluginConfig = {
    name: 'cekimut',
    alias: ['imut', 'cute'],
    category: 'cek',
    description: 'Comprueba que tan adorable eres',
    usage: '.cekimut <nombre>',
    example: '.cekimut Ani',
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
        desc = 'MUY ADORABLE! Kawaii~~ 🥺💕'
    } else if (percent >= 70) {
        desc = 'Demasiado adorable! 😍'
    } else if (percent >= 50) {
        desc = 'Bastante adorable~ 🌸'
    } else if (percent >= 30) {
        desc = 'Tiene algo adorable 😊'
    } else {
        desc = 'Tal vez cool, no adorable? 😎'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de ternura es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de ternura de @${mentioned.split('@')[0]} verdad?
    
Su nivel de ternura es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }