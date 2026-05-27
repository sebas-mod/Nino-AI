const pluginConfig = {
    name: 'cekngantuk',
    alias: ['ngantuk', 'sleepy'],
    category: 'cek',
    description: 'Comprueba tu nivel de sueno',
    usage: '.cekngantuk <nombre>',
    example: '.cekngantuk Budi',
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
    if (percent >= 90) desc = 'ZZZZZ... Ve a dormir! 😴💤'
    else if (percent >= 70) desc = 'Ojos casi apagados~ 😪'
    else if (percent >= 50) desc = 'Un poco con sueno 🥱'
    else if (percent >= 30) desc = 'Todavia fresco! ☕'
    else desc = 'Muy despierto! Insomnio? 👀'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de sueno es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de sueno de @${mentioned.split('@')[0]} verdad?
    
Su nivel de sueno es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }