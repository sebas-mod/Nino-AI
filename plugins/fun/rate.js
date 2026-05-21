const pluginConfig = {
    name: 'rate',
    alias: ['nilai', 'rating'],
    category: 'fun',
    description: 'Pidele al bot que califique algo',
    usage: '.rate <algo>',
    example: '.rate mi cara',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const ratings = [
    { score: '10/10', comment: 'Perfecto! No tiene comparacion!' },
    { score: '9/10', comment: 'Casi perfecto! Muy bueno!' },
    { score: '8/10', comment: 'Muy bueno! Excelente!' },
    { score: '7/10', comment: 'Bastante bueno, por encima del promedio!' },
    { score: '6/10', comment: 'Aceptable, puede mejorar.' },
    { score: '5/10', comment: 'Normal, estandar.' },
    { score: '4/10', comment: 'Hmm, le falta un poco.' },
    { score: '3/10', comment: 'Necesita muchas mejoras.' },
    { score: '2/10', comment: 'Ay, todavia esta lejos de ser bueno.' },
    { score: '1/10', comment: 'Lo siento, pero esto esta grave.' },
    { score: '100/10', comment: 'LEYENDA! Mas que perfecto!' },
    { score: '11/10', comment: 'Supera las expectativas!' },
    { score: '69/100', comment: 'Bien...' },
    { score: '420/10', comment: 'ARDIENTE!' },
    { score: '∞/10', comment: 'Durisimo, amigo' },
    { score: '7.5/10', comment: 'Solido! Buen trabajo!' },
    { score: '8.5/10', comment: 'Impresionante!' },
    { score: '9.5/10', comment: 'Casi perfeccion!' },
    { score: '-1/10', comment: 'No se que decir...' },
    { score: '???/10', comment: 'Error 404: Calificacion no encontrada.' }
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`⭐ *ʀᴀᴛᴇ*\n\n> Ingresa algo para calificar!\n\n*Ejemplo:*\n> .rate mi cara`);
    }
    
    const rating = ratings[Math.floor(Math.random() * ratings.length)];
    
    await m.reply(`Mi calificacion: *${rating.score}*
${rating.comment}`);
}

export { pluginConfig as config, handler }
