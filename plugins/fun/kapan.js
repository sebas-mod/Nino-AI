const pluginConfig = {
    name: 'kapan',
    alias: ['when'],
    category: 'fun',
    description: 'Preguntale al bot cuando ocurrira algo',
    usage: '.kapan <pregunta>',
    example: '.kapan me casare?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Tal vez manana?',
    'Parece que el proximo ano.',
    'En 3 dias!',
    'Hmm, aun falta bastante.',
    'Muy pronto!',
    'Cuando sea el momento, ocurrira.',
    'El proximo mes!',
    'Quien sabe cuando, lo importante es tener paciencia.',
    'En poco tiempo!',
    'Tal vez en 10 anos?',
    'No falta mucho!',
    'Si es destino, se encontraran.',
    'Hmm, es dificil de predecir.',
    'La proxima semana!',
    'Si te esfuerzas mas, sera mas rapido!',
    'Cuando llegue el momento correcto.',
    'Lo antes posible, tranquilo.',
    'Cuando ya estes listo.',
    'En cuestion de dias!',
    'Cuando estes listo para recibirlo.'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`⏰ *ᴋᴀᴘᴀɴ*\n\n> Ingresa una pregunta!\n\n*Ejemplo:*\n> .kapan me casare?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?\n*${answer}*`);
}

export { pluginConfig as config, handler }
