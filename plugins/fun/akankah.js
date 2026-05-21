const pluginConfig = {
    name: 'akankah',
    alias: ['akan', 'will'],
    category: 'fun',
    description: 'Preguntale al bot si algo ocurrira',
    usage: '.akankah <pregunta>',
    example: '.akankah tendre exito?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Si, seguro que ocurrira!',
    'No, parece que no ocurrira.',
    'Puede que si, puede que no.',
    'Si Dios quiere, ocurrira!',
    'Hmm, es dificil de predecir.',
    'Seguro! Solo confia!',
    'Parece que no.',
    'Ocurrira si te esfuerzas.',
    'Algun dia, seguro.',
    'No ocurrira, lo siento.',
    'Claro que ocurrira! Solo espera!',
    'Hmm, tengo dudas.',
    'Ocurrira! Confia en el proceso!',
    'La posibilidad es pequena.',
    'Seguro que ocurrira, estoy convencido!',
    'No ocurrira, busca otra cosa.',
    'Ocurrira, pero tomara tiempo.',
    'Si Dios quiere!',
    'Si es destino, seguro ocurrira.',
    'Ocurrira en el momento correcto!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`🔮 *ᴀᴋᴀɴᴋᴀʜ*\n\n> Ingresa una pregunta!\n\n*Ejemplo:*\n> .akankah tendre exito?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
