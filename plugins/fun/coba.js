const pluginConfig = {
    name: 'coba',
    alias: ['try'],
    category: 'fun',
    description: 'Prueba preguntarle algo al bot',
    usage: '.coba <pregunta>',
    example: '.coba adivina que estoy pensando',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Hmm, voy a intentar... estas pensando en comida!',
    'Adivino... estas aburrido!',
    'A ver... parece que estas feliz!',
    'Hmm, creo que estas confundido.',
    'Voy a adivinar... extranas a alguien?',
    'Parece que estas relajado.',
    'Apuesto a que sigues mirando el celular.',
    'Hmm, seguro estas aburrido, no?',
    'Adivino... quieres salir a pasear!',
    'Creo que necesitas entretenimiento.',
    'Hmm, parece que estas contento!',
    'Lo intento... seguro tienes curiosidad!',
    'Mi suposicion: estas acostado descansando.',
    'Hmm, quizas piensas en alguien especial.',
    'Lo intento: quieres desahogarte?',
    'Parece que quieres jugar!',
    'Hmm, adivino que estas escuchando musica.',
    'Voy a adivinar... estas en tu habitacion!',
    'Creo que estas esperando algo.',
    'Hmm, mi suposicion: necesitas alguien con quien hablar!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`🎯 *ᴄᴏʙᴀ*\n\n> Ingresa algo!\n\n*Ejemplo:*\n> .coba adivina que estoy pensando`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
