const pluginConfig = {
    name: 'cekbaik',
    alias: ['baik', 'kind'],
    category: 'cek',
    description: 'Comprueba que tan bueno eres',
    usage: '.cekbaik <nombre>',
    example: '.cekbaik Budi',
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
        desc = 'Genial! eres la persona mas buena de este mundo! 😇✨'
    } else if (percent >= 70) {
        desc = 'Buen corazon y nada presumido! 💝'
    } else if (percent >= 50) {
        desc = 'Bastante bueno 😊'
    } else if (percent >= 30) {
        desc = 'Un poco bueno 🙂'
    } else {
        desc = 'Hmm, necesitas reflexionar ?? 🤔'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de bondad es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de bondad de @${mentioned.split('@')[0]} verdad?
    
Su nivel de bondad es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
