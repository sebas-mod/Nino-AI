const pluginConfig = {
    name: 'cekla personalidad de',
    alias: ['la personalidad de', 'personality'],
    category: 'cek',
    description: 'Comprueba tu personalidad',
    usage: '.cekla personalidad de <nombre>',
    example: '.cekla personalidad de Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const personalities = [
    { type: 'INTJ', title: 'El Arquitecto', desc: 'Visionario, estrategico e independiente' },
    { type: 'INTP', title: 'El Logico', desc: 'Analitico, innovador y curioso' },
    { type: 'ENTJ', title: 'El Comandante', desc: 'Firme, ambicioso y lider natural' },
    { type: 'ENTP', title: 'El Debatiente', desc: 'Inteligente, curioso y amante de los retos' },
    { type: 'INFJ', title: 'El Defensor', desc: 'Idealista, sabio y empatico' },
    { type: 'INFP', title: 'El Mediador', desc: 'Creativo, idealista y fiel' },
    { type: 'ENFJ', title: 'El Protagonista', desc: 'Carismatico, inspirador y atento' },
    { type: 'ENFP', title: 'El Activista', desc: 'Entusiasta, creativo y social' },
    { type: 'ISTJ', title: 'El Logista', desc: 'Responsable, practico y detallista' },
    { type: 'ISFJ', title: 'El Protector', desc: 'Fiel, solidario y confiable' },
    { type: 'ESTJ', title: 'El Ejecutivo', desc: 'Organizado, firme y tradicional' },
    { type: 'ESFJ', title: 'El Consul', desc: 'Atento, social y leal' },
    { type: 'ISTP', title: 'El Virtuoso', desc: 'Flexible, observador y practico' },
    { type: 'ISFP', title: 'El Aventurero', desc: 'Artistico, sensible y espontaneo' },
    { type: 'ESTP', title: 'El Emprendedor', desc: 'Energico, perceptivo y valiente' },
    { type: 'ESFP', title: 'El Animador', desc: 'Espontaneo, energico y divertido' }
]

async function handler(m) {
        const mentioned = m.mentionedJid[0] || m.sender

        const p = personalities[Math.floor(Math.random() * personalities.length)]
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu personalidad es *${p.type} - ${p.title}*
\`\`\`${p.desc}\`\`\`` : `Quieres comprobar la personalidad de @${mentioned.split('@')[0]} verdad?
    
Su personalidad es *${p.type} - ${p.title}*
\`\`\`${p.desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }