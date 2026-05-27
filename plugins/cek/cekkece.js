const pluginConfig = {
    name: 'cekkece',
    alias: ['kece', 'cool'],
    category: 'cek',
    description: 'Comprueba que tan genial eres',
    usage: '.cekkece <nombre>',
    example: '.cekkece Budi',
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
        desc = 'GENIAL A FULL! 😎🔥'
    } else if (percent >= 70) {
        desc = 'Muy genial! ✨'
    } else if (percent >= 50) {
        desc = 'Bastante genial~ 👍'
    } else if (percent >= 30) {
        desc = 'Un poco genial 😊'
    } else {
        desc = 'Normal, pero sigues siendo cool! 🙂'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de estilo es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de estilo de @${mentioned.split('@')[0]} verdad?
    
Su nivel de estilo es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }