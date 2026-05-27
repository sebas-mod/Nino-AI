const pluginConfig = {
    name: 'cekcantik',
    alias: ['cantik', 'beautiful'],
    category: 'cek',
    description: 'Comprueba que tan bonita eres',
    usage: '.cekcantik <nombre>',
    example: '.cekcantik Ani',
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
        desc = 'Muy bonita, como una princesa! 👸✨'
    } else if (percent >= 70) {
        desc = 'Muy bonita! 💕'
    } else if (percent >= 50) {
        desc = 'Dulce y bonita~ 🌸'
    } else if (percent >= 30) {
        desc = 'Bastante bonita 😊'
    } else {
        desc = 'Sigues siendo bonita! 💖'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de belleza es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de belleza de @${mentioned.split('@')[0]} verdad?
    
Su nivel de belleza es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }