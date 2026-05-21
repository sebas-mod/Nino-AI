const pluginConfig = {
    name: 'dimana',
    alias: ['where', 'mana'],
    category: 'fun',
    description: 'Preguntale al bot donde esta algo',
    usage: '.dimana <pregunta>',
    example: '.dimana esta mi alma gemela?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Cerca de ti!',
    'Lejos, por alla.',
    'En un lugar que no esperas.',
    'En tu corazon.',
    'Por aqui cerca.',
    'Hmm, intenta buscar en la habitacion.',
    'Ahi afuera, esperandote.',
    'En el mismo lugar que tu.',
    'En algun lugar hermoso.',
    'Detras de la puerta.',
    'A tu izquierda.',
    'Frente a tus ojos!',
    'Muy lejos, tal vez en el extranjero?',
    'En un lugar lleno de recuerdos.',
    'En todas partes!',
    'En el mundo virtual.',
    'En el mundo de los suenos.',
    'En un lugar secreto.',
    'Hmm, es dificil explicar la ubicacion.',
    'En un lugar que te hara feliz.'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`📍 *ᴅɪᴍᴀɴᴀ*\n\n> Ingresa una pregunta!\n\n*Ejemplo:*\n> .dimana esta mi alma gemela?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
