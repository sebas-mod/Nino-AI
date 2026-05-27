const pluginConfig = {
    name: 'cekkaya',
    alias: ['kaya', 'rich'],
    category: 'cek',
    description: 'Comprueba que tan rico eres',
    usage: '.cekkaya <nombre>',
    example: '.cekkaya Budi',
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
    let emoji = ''
    if (percent >= 90) {
        desc = 'Magnate! Crazy rich! 💎'
        emoji = '👑'
    } else if (percent >= 70) {
        desc = 'Muy rico! 💰'
        emoji = '💎'
    } else if (percent >= 50) {
        desc = 'Bastante acomodado 💵'
        emoji = '💰'
    } else if (percent >= 30) {
        desc = 'Suficiente para vivir 😊'
        emoji = '💵'
    } else {
        desc = 'Animo ahorrando! 🙏'
        emoji = '🪙'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de riqueza es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de riqueza de @${mentioned.split('@')[0]} verdad?
    
Su nivel de riqueza es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }