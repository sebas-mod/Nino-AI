const pluginConfig = {
    name: 'cekgamer',
    alias: ['gamer', 'pro'],
    category: 'cek',
    description: 'Comprueba que tan pro gamer eres',
    usage: '.cekgamer <nombre>',
    example: '.cekgamer Budi',
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
        desc = 'PRO PLAYER! Esports level! 🏆'
    } else if (percent >= 70) {
        desc = 'Muy habil! 🎮'
    } else if (percent >= 50) {
        desc = 'Bastante pro 👍'
    } else if (percent >= 30) {
        desc = 'Todavia eres noob 😅'
    } else {
        desc = 'Mejor juega a cocinar 🍳'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel gamer es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel gamer de @${mentioned.split('@')[0]} verdad?
    
Su nivel gamer es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }