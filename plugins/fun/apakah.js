const pluginConfig = {
    name: 'apakah',
    alias: ['apa'],
    category: 'fun',
    description: 'Preguntale al bot si algo es verdad',
    usage: '.apakah <pregunta>',
    example: '.apakah puedo ser rico?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Si, por supuesto!',
    'No, parece que no.',
    'Tal vez, intenta de nuevo luego.',
    'Hmm... creo que si.',
    'Tengo dudas, pero puede ser.',
    'Pasti! 100%!',
    'Imposible.',
    'Puede ser, quien sabe?',
    'En mi opinion, si.',
    'Vaya, parece que no.',
    'Claro, por que no?',
    'No lo se, prueba preguntarle a alguien mas.',
    'Por supuesto, seguro!',
    'Hmm... parece que no.',
    'Estoy seguro de que si!',
    'Totalmente imposible.',
    'Quizas, pero no te ilusiones demasiado.',
    'Claro que si!',
    'No, lo siento.',
    'Si puedes! Animo!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`❓ *ᴀᴘᴀᴋᴀʜ*\n\n> Ingresa una pregunta!\n\n*Ejemplo:*\n> .apakah puedo ser rico?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
