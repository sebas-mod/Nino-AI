/**
 * Putus - End relationship
 */

import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'putus',
    alias: ['breakup', 'cerai'],
    category: 'fun',
    description: 'Termina la relacion con la pareja',
    usage: '.putus',
    example: '.putus',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    let senderData = db.getUser(m.sender) || {}
    if (!senderData.fun) senderData.fun = {}
    if (!senderData.fun.pasangan) {
        await m.react('❌')
        return m.reply(
            `❌ *No tienes pareja*\n\n` +
            `Busca una primero con \`${m.prefix}tembak @tag\``
        )
    }
    const exPartner = senderData.fun.pasangan
    let exData = db.getUser(exPartner) || {}
    delete senderData.fun.pasangan
    if (exData.fun?.pasangan === m.sender) {
        delete exData.fun.pasangan
        db.setUser(exPartner, exData)
    }
    db.setUser(m.sender, senderData)
    await m.react('💔')
    await m.reply(
        `💔 *PUTUS!*\n\n` +
        `@${m.sender.split('@')[0]} y @${exPartner.split('@')[0]} terminaron oficialmente!!\n\n` +
        `Espero que encuentren algo mejor! 🙏`,
        { mentions: [m.sender, exPartner] }
    )
}

export { pluginConfig as config, handler }
