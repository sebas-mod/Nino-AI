import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'deltoxic',
    alias: ['hapustoxic', 'remtoxic', 'removetoxic'],
    category: 'group',
    description: 'Elimina una palabra toxica de la lista',
    usage: '.deltoxic <kata>',
    example: '.deltoxic kata_kasar',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const word = m.args.join(' ').trim().toLowerCase()
    
    if (!word) {
        return m.reply(
            `🗑️ *ᴅᴇʟ ᴛᴏxɪᴄ*\n\n` +
            `> Usa: \`.deltoxic <kata>\`\n\n` +
            `\`Ejemplo: ${m.prefix}deltoxic katakasar\``
        )
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const toxicWords = groupData.toxicWords || []
    
    const index = toxicWords.indexOf(word)
    
    if (index === -1) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Kata \`${word}\` no hay di lista`)
    }
    
    toxicWords.splice(index, 1)
    db.setGroup(m.chat, { toxicWords })
    
    m.react('✅')
    
    await m.reply(
        `✅ *ᴋᴀᴛᴀ ᴛᴏxɪᴄ ᴅɪʜᴀᴘᴜs*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 📝 ᴋᴀᴛᴀ: \`${word}\`\n` +
        `┃ 📊 sɪsᴀ: \`${toxicWords.length}\` kata\n` +
        `╰┈┈⬡`
    )
}

export { pluginConfig as config, handler }