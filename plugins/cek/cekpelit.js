const pluginConfig = {
    name: 'cekpelit',
    alias: ['pelit', 'kikir'],
    category: 'cek',
    description: 'Comprueba que tan tacaño eres',
    usage: '.cekpelit <nombre>',
    example: '.cekpelit Budi',
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
        desc = 'SUPER TACANO! Cuida el dinero con la vida! 💸'
    } else if (percent >= 70) {
        desc = 'Muy tacano! 🙊'
    } else if (percent >= 50) {
        desc = 'Bastante tacano 😅'
    } else if (percent >= 30) {
        desc: 'Un poco ahorrador 😊'
    } else {
        desc = 'Muy generoso! 🎁'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de tacañeria es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de tacañeria de @${mentioned.split('@')[0]} verdad?
    
Su nivel de tacañeria es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }