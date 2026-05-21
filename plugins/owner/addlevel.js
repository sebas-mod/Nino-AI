import { getDatabase } from '../../src/lib/ourin-database.js'
import { calculateLevel, getRole, addExpWithLevelCheck } from './../../src/lib/ourin-level.js'
const pluginConfig = {
    name: 'addlevel',
    alias: ['tambahlevel', 'givelevel', 'addlvl'],
    category: 'owner',
    description: 'Agregar nivel al usuario (via exp)',
    usage: '.addlevel <cantidad> @user',
    example: '.addlevel 5 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
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
    let levels = parseInt(numArg) || 0
    
    let targetJid = await extractTarget(m)
    
    if (!targetJid && levels > 0) {
        targetJid = m.sender
    }
    
    if (!targetJid || levels <= 0) {
        return m.reply(
            `📊 *ᴀᴅᴅ ʟᴇᴠᴇʟ*\n\n` +
            `╭┈┈⬡「 📋 *ᴜsᴀɢᴇ* 」\n` +
            `┃ > \`.addlevel <cantidad>\` - a ti mismo\n` +
            `┃ > \`.addlevel <cantidad> @user\` - ke orang lain\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> Ejemplo: \`${m.prefix}addlevel 5\``
        )
    }
    
    if (levels <= 0) {
        return m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> La cantidad de niveles debe ser mayor que 0`)
    }
    
    const user = db.getUser(targetJid) || db.setUser(targetJid)
    
    const oldLevel = calculateLevel(user.exp || 0)
    const expToAdd = levels * 20000
    
    const addResult = addExpWithLevelCheck(sock, m, db, user, expToAdd)
    
    await m.react('✅')
    
    await m.reply(
        `✅ Nivel agregado correctamente a *@${targetJid.split('@')[0]}* sebanyak *${levels} Level*\n\nAhora tiene *${addResult.newLevel || calculateLevel(user.exp)}* level. y tiene el rol *${getRole(addResult.newLevel || calculateLevel(user.exp))}*`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }