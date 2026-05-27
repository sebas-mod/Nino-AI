const pluginConfig = {
    name: 'cekbucin',
    alias: ['bucin'],
    category: 'cek',
    description: 'Comprueba que tan enamoradizo eres',
    usage: '.cekbucin <nombre>',
    example: '.cekbucin Budi',
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
        desc = 'ENAMORADIZO EXTREMO! Ya no tiene salvacion 😭💔'
    } else if (percent >= 70) {
        desc = 'Muy enamoradizo~ 🥺'
    } else if (percent >= 50) {
        desc = 'Bastante enamoradizo 💕'
    } else if (percent >= 30) {
        desc = 'Un poco enamoradizo 😊'
    } else {
        desc = 'Tranquilo, no eres tan enamoradizo 😎'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de enamoramiento es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de enamoramiento de @${mentioned.split('@')[0]} verdad?
    
Su nivel de enamoramiento es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }