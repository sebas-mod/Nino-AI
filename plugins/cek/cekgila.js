const pluginConfig = {
    name: 'cekgila',
    alias: ['gila', 'crazy'],
    category: 'cek',
    description: 'Comprueba que tan loco eres',
    usage: '.cekgila <nombre>',
    example: '.cekgila Budi',
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
        desc = 'LOCO DE VERDAD! Directo al psiquiatrico! 🤪'
    } else if (percent >= 70) {
        desc = 'Casi loco 😵'
    } else if (percent >= 50) {
        desc = 'Bastante cuerdo 😅'
    } else if (percent >= 30) {
        desc: 'Normal 🙂'
    } else {
        desc = 'Muy cuerdo! 😇'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de locura es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de locura de @${mentioned.split('@')[0]} verdad?
    
Su nivel de locura es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }