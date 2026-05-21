const pluginConfig = {
    name: 'berapa',
    alias: ['howmuch', 'howmany'],
    category: 'fun',
    description: 'Preguntale al bot cuanto o cuantos',
    usage: '.berapa <pregunta>',
    example: '.berapa edad de mi alma gemela?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '1',
    '7',
    '12',
    '21',
    '99',
    '69',
    '100',
    '50',
    '25',
    '1000',
    '5',
    '17',
    '88',
    '33',
    'nada (la respuesta siempre es nada)',
    'Muchisimo!',
    'Solo un poco.',
    'Incontable!',
    'Hmm, alrededor de 10.',
    'Mas de lo que crees!',
    'No se, que pereza'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`🔢 *ʙᴇʀᴀᴘᴀ*\n\n> Ingresa una pregunta!\n\n*Ejemplo:*\n> .berapa edad de mi alma gemela?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
