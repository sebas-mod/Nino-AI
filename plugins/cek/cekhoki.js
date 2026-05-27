const pluginConfig = {
    name: 'cekhoki',
    alias: ['hoki', 'lucky'],
    category: 'cek',
    description: 'Comprueba que tan afortunado eres',
    usage: '.cekhoki <nombre>',
    example: '.cekhoki Budi',
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
        desc = 'SUERTE DIVINA! En gacha seguro ganas! 🍀✨'
    } else if (percent >= 70) {
        desc = 'Muy afortunado! 🎰'
    } else if (percent >= 50) {
        desc = 'Bastante afortunado 🍀'
    } else if (percent >= 30) {
        desc = 'Un poco afortunado 😊'
    } else {
        desc = 'Paciencia, hoy hay mala suerte 😅'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de suerte es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de suerte de @${mentioned.split('@')[0]} verdad?
    
Su nivel de suerte es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }