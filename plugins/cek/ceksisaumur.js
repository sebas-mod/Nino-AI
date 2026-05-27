const pluginConfig = {
    name: 'ceksisaumur',
    alias: ['sisaumur', 'umur'],
    category: 'cek',
    description: 'Comprueba tu tiempo de vida restante',
    usage: '.ceksisaumur <nombre>',
    example: '.ceksisaumur Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
        
    const mentioned = m.mentionedJid[0] || m.sender

        
    const tahun = Math.floor(Math.random() * 80) + 20
    const bulan = Math.floor(Math.random() * 12)
    const hari = Math.floor(Math.random() * 30)
    
    let desc = ''
    if (tahun > 80) {
        desc = 'Muy larga vida! 🎉'
    } else if (tahun > 60) {
        desc = 'Bastante largo~ ✨'
    } else if (tahun > 40) {
        desc = 'Suficiente 😊'
    } else {
        desc = 'Cuida tu salud! 🙏'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu tiempo de vida restante es *${tahun} Anos ${bulan} Meses ${hari} Dias*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el tiempo de vida restante de @${mentioned.split('@')[0]} verdad?
    
Su tiempo de vida restante es *${tahun} Anos ${bulan} Meses ${hari} Dias*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
