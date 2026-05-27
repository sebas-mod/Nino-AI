const pluginConfig = {
    name: 'cekganteng',
    alias: ['ganteng', 'handsome'],
    category: 'cek',
    description: 'Comprueba que tan guapo eres',
    usage: '.cekganteng <nombre>',
    example: '.cekganteng Budi',
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
        desc = 'Guapura maxima! 😍🔥'
    } else if (percent >= 70) {
        desc = 'Muy guapo! 😎'
    } else if (percent >= 50) {
        desc = 'Bastante guapo~ 👍'
    } else if (percent >= 30) {
        desc = 'Bastante normal 😅'
    } else {
        desc = 'Tal vez belleza interior? 🤭'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de guapura es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de guapura de @${mentioned.split('@')[0]} verdad?
    
Su nivel de guapura es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }