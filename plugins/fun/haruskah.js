const pluginConfig = {
    name: 'haruskah',
    alias: ['harus', 'should'],
    category: 'fun',
    description: 'Preguntale al bot si deberias hacer algo',
    usage: '.haruskah <pregunta>',
    example: '.haruskah deberia declarar mi amor?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Si, debes hacerlo!',
    'No hace falta.',
    'Hmm, depende de ti.',
    'Si, sin duda! No dudes!',
    'No necesariamente.',
    'Si crees que hace falta, hazlo!',
    'Piensalo bien primero.',
    'Debes hacerlo! Ahora!',
    'No, mejor espera un poco.',
    'Debes hacerlo, pero con cuidado.',
    'No hace falta, pero puedes.',
    'Obligatorio!',
    'Hmm, mejor saltalo.',
    'Hazlo cuando estes seguro.',
    'Debes hacerlo, por tu futuro!',
    'No hace falta, tranquilo.',
    'Adelante!',
    'No te apresures, piensalo otra vez.',
    'Claro que debes!',
    'Mira primero la situacion.'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`⚖️ *ʜᴀʀᴜsᴋᴀʜ*\n\n> Ingresa una pregunta!\n\n*Ejemplo:*\n> .haruskah deberia declarar mi amor?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
