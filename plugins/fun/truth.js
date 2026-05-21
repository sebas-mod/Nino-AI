import { getRandomItem } from '../../src/lib/ourin-game-data.js'
const pluginConfig = {
    name: 'truth',
    alias: ['truthq'],
    category: 'fun',
    description: 'Pregunta aleatoria de truth',
    usage: '.truth',
    example: '.truth',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m) {
    const question = getRandomItem('truth.json');
    if (!question) {
        await m.reply('❌ Datos no disponibles!');
        return;
    }
    await m.reply(`\`\`\`${question}\`\`\``);
}

export { pluginConfig as config, handler }
