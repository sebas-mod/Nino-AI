const pluginConfig = {
    name: 'bisakah',
    alias: ['bisa'],
    category: 'fun',
    description: 'Preguntale al bot si algo es posible',
    usage: '.bisakah <pregunta>',
    example: '.bisakah aprobare el examen?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Claro que puedes! Solo ten confianza!',
    'Hmm, parece dificil.',
    'Por supuesto que puedes! Animo!',
    'No puedes, lo siento.',
    'Quizas puedas, si te esfuerzas mucho.',
    'Seguro puedes! No te rindas!',
    'Es algo dificil, pero se puede intentar.',
    'Si puedes! Estoy seguro!',
    'Parece que no.',
    'Puedes! Demuestralo!',
    'Hmm... tengo dudas.',
    'Claro que puedes! Sigue adelante!',
    'No puedes, intenta otra cosa.',
    'Puedes! Cree en ti mismo!',
    'Es dificil, pero no imposible.',
    'Absolutamente! Seguro puedes!',
    'Parece que necesitas un esfuerzo extra.',
    'Puedes! No dudes de ti!',
    'Hmm, intenta de nuevo luego.',
    'Puedes! Creo en ti!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`💪 *ʙɪsᴀᴋᴀʜ*\n\n> Ingresa una pregunta!\n\n*Ejemplo:*\n> .bisakah aprobare el examen?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
