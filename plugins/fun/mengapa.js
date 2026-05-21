const pluginConfig = {
    name: 'mengapa',
    alias: ['kenapa', 'why'],
    category: 'fun',
    description: 'Preguntale al bot por que ocurre algo',
    usage: '.mengapa <pregunta>',
    example: '.mengapa el cielo es azul?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Porque asi estaba destinado.',
    'Hmm, buena pregunta! Yo tambien estoy confundido.',
    'Porque asi funciona.',
    'Porque Dios asi lo quiso.',
    'No lo se, buscalo en Google.',
    'Porque si.',
    'Tal vez por casualidad?',
    'Porque el mundo esta lleno de misterio.',
    'Hmm, es dificil de explicar.',
    'Porque el universo funciona de formas misteriosas.',
    'Yo tambien tengo curiosidad, por que sera?',
    'Porque eso debia ocurrir.',
    'Buena pregunta! Lamentablemente no tengo la respuesta.',
    'Porque esa es la singularidad de la vida.',
    'Porque cada cosa tiene su propia razon.',
    'Hmm... necesito tiempo para pensarlo.',
    'Porque esa es la logica.',
    'Creo que porque tenia que ser asi.',
    'Porque todo esta conectado.',
    'Eso tambien me lo pregunto!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`🤔 *ᴍᴇɴɢᴀᴘᴀ*\n\n> Ingresa una pregunta!\n\n*Ejemplo:*\n> .mengapa el cielo es azul?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?\n*${answer}*`);
}

export { pluginConfig as config, handler }
