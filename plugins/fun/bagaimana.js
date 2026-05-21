const pluginConfig = {
    name: 'bagaimana',
    alias: ['gimana', 'how'],
    category: 'fun',
    description: 'Preguntale al bot como hacer algo',
    usage: '.bagaimana <pregunta>',
    example: '.bagaimana como tener exito?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Es facil: solo tienes que hacerlo!',
    'Hmm, es dificil de explicar. Intentalo primero!',
    'Con esfuerzo y fe, por supuesto.',
    'Pues asi es la forma.',
    'No estoy muy seguro, busca otra referencia.',
    'Poco a poco, al final podras.',
    'Con trabajo duro y sin rendirse!',
    'Primero, cree en ti mismo.',
    'Hmm, cada persona tiene su forma.',
    'Solo sigue a tu corazon.',
    'Aprende de quienes ya tienen experiencia.',
    'Paso a paso, sin apurarte.',
    'Con una determinacion fuerte!',
    'Empieza por lo pequeno.',
    'Se constante, al final podras.',
    'No le des tantas vueltas, actua!',
    'Facil! Solo empieza!',
    'La forma? Prueba primero!',
    'Con la estrategia correcta.',
    'Hmm, yo tambien sigo aprendiendo.'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`📋 *ʙᴀɢᴀɪᴍᴀɴᴀ*\n\n> Ingresa una pregunta!\n\n*Ejemplo:*\n> .bagaimana como tener exito?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
