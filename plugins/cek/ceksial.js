const pluginConfig = {
    name: 'ceksial',
    alias: ['sial', 'apes'],
    category: 'cek',
    description: 'Comprueba que tan salado eres',
    usage: '.ceksial <nombre>',
    example: '.ceksial Budi',
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
        desc = 'MUY SALADO! Mejor quedate en casa! 😭'
    } else if (percent >= 70) {
        desc = 'Hoy hay mala suerte~ 😢'
    } else if (percent >= 50) {
        desc = 'Bastante salado 😓'
    } else if (percent >= 30) {
        desc = 'Un poco salado 😕'
    } else {
        desc = 'Sin mala suerte, con buena suerte! 🍀'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de mala suerte es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de mala suerte de @${mentioned.split('@')[0]} verdad?
    
Su nivel de mala suerte es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }