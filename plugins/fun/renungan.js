import { getRandomItem } from '../../src/lib/ourin-game-data.js'
import { fetchBuffer } from '../../src/lib/ourin-utils.js'
const pluginConfig = {
    name: 'renungan',
    alias: ['motivasi', 'mutiara'],
    category: 'fun',
    description: 'Imagen aleatoria de reflexion o motivacion',
    usage: '.renungan',
    example: '.renungan',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    m.react('🕕')
    try {
        await sock.sendMedia(m.chat, getRandomItem('renungan.json'), null, m, {
            type: 'image'
        })
        m.react('✅')
    } catch (error) {
        m.react('❌')
        await m.reply('❌ No se pudo obtener la imagen. Intenta de nuevo!');
    }
}

export { pluginConfig as config, handler }
