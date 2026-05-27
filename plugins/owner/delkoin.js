import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'delkoin',
    alias: ['kurangkoin', 'removekoin', 'delcoin', 'delmoney'],
    category: 'owner',
    description: 'Kurangi koin user',
    usage: '.delkoin <cantidad> @user',
    example: '.delkoin 50000 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function formatKoin(num) {
    if (num >= 1000000000000) return (num / 1000000000000).toFixed(2) + 'T'
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function extractTarget(m) {
    if (m.quoted) return m.quoted.sender
    if (m.mentionedJid?.length) return m.mentionedJid[0]
    return null
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args
    
    const numArg = args.find(a => !isNaN(a) && !a.startsWith('@'))
    const amount = parseInt(numArg) || 0
    
    let targetJid = await extractTarget(m)
    
    if (!targetJid && amount > 0) {
        targetJid = m.sender
    }
    
    if (!targetJid || amount <= 0) {
        return m.reply(
            `💰 *ᴅᴇʟ ᴋᴏɪɴ*\n\n` +
            `> \`.delkoin <cantidad>\` - de ti mismo\n` +
            `> \`.delkoin <cantidad> @user\` - del usuario\n\n` +
            `\`Ejemplo: ${m.prefix}delkoin 50000\``
        )
    }
    
    if (amount <= 0) {
        return m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> La cantidad debe ser mayor que 0`)
    }
    
    const user = db.getUser(targetJid)
    
    if (!user) {
        return m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> Usuario no encontrado en la base de datos`)
    }
    
    const newKoin = db.updateKoin(targetJid, -amount)
    
    await m.react('✅')
    
    await m.reply(
        `✅ *ᴋᴏɪɴ ᴅɪᴋᴜʀᴀɴɢɪ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 👤 ᴜsᴇʀ: @${targetJid.split('@')[0]}\n` +
        `┃ ➖ ᴋᴜʀᴀɴɢ: *-${formatKoin(amount)}*\n` +
        `┃ 💰 sɪsᴀ: *${formatKoin(newKoin)}*\n` +
        `╰┈┈⬡`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }