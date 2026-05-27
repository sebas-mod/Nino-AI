import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'delexp',
    alias: ['kurangexp', 'removeexp', 'delxp'],
    category: 'owner',
    description: 'Kurangi exp user',
    usage: '.delexp <cantidad> @user',
    example: '.delexp 5000 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function formatNumber(num) {
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
            `⭐ *ᴅᴇʟ ᴇxᴘ*\n\n` +
            `> \`.delexp <cantidad>\` - de ti mismo\n` +
            `> \`.delexp <cantidad> @user\` - del usuario\n\n` +
            `\`Ejemplo: ${m.prefix}delexp 5000\``
        )
    }
    
    if (amount <= 0) {
        return m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> La cantidad debe ser mayor que 0`)
    }
    
    const user = db.getUser(targetJid)
    
    if (!user) {
        return m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> Usuario no encontrado en la base de datos`)
    }
    
    const newExp = db.updateExp(targetJid, -amount)
    
    await m.react('✅')
    
    await m.reply(
        `✅ *ᴇxᴘ ᴅɪᴋᴜʀᴀɴɢɪ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 👤 ᴜsᴇʀ: @${targetJid.split('@')[0]}\n` +
        `┃ ➖ ᴋᴜʀᴀɴɢ: *-${formatNumber(amount)}*\n` +
        `┃ ⭐ sɪsᴀ: *${formatNumber(newExp)}*\n` +
        `╰┈┈⬡`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }