const pluginConfig = {
    name: 'cekgacha',
    alias: ['gacha', 'luck'],
    category: 'cek',
    description: 'Comprueba tu suerte en gacha',
    usage: '.cekgacha <nombre>',
    example: '.cekgacha Budi',
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
    if (percent >= 90) desc = 'SUERTE EXTREMA! SSR GARANTIZADO! ✨💎'
    else if (percent >= 70) desc = 'Con suerte! Seguro sale SR o mas! 🍀'
    else if (percent >= 50) desc = 'Un poco de suerte 😊'
    else if (percent >= 30) desc = 'Hmm... reza mas fuerte! 🙏'
    else desc = 'MALA SUERTE! Mejor deja el gacha para despues! 💔'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de suerte gacha es *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de suerte gacha de @${mentioned.split('@')[0]} verdad?
    
Su nivel de suerte gacha es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }