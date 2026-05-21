import { getRandomItem } from '../../src/lib/ourin-game-data.js'
const pluginConfig = {
    name: 'dare',
    alias: ['dareq', 'tantang'],
    category: 'fun',
    description: 'Reto aleatorio de dare',
    usage: '.dare',
    example: '.dare',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m) {
    const challenge = getRandomItem('dare.json');
    
    if (!challenge) {
        await m.reply('❌ Datos no disponibles!');
        return;
    }
    
    await m.reply(`\`\`\`${challenge}\`\`\``);
}

export { pluginConfig as config, handler }
