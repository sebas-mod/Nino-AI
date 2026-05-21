import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'cekpacar',
    alias: ['pacar', 'pasangan', 'gebetan'],
    category: 'fun',
    description: 'Revisa el estado de relacion de alguien',
    usage: '.cekpacar o .cekpacar @tag',
    example: '.cekpacar',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    let targetJid = m.sender
    let isOther = false
    if (m.quoted) {
        targetJid = m.quoted.sender
        isOther = true
    } else if (m.mentionedJid?.[0]) {
        targetJid = m.mentionedJid[0]
        isOther = true
    } else if (args[0]) {
        let num = args[0].replace(/[^0-9]/g, '')
        if (num.length > 5 && num.length < 20) {
            targetJid = num + '@s.whatsapp.net'
            isOther = true
        }
    }
    
    const userData = db.getUser(targetJid) || {}
    
    if (!userData.fun?.pasangan) {
        const nama = isOther ? `@${targetJid.split('@')[0]}` : 'Tu'
        await m.react('💔')
        return m.reply(
            `💔 *sᴛᴀᴛᴜs ʜᴜʙᴜɴɢᴀɴ*\n\n` +
            `*${nama}* no tiene pareja.\n` +
            `TIP: Busca pareja primero con \`${m.prefix}tembak @tag\``,
            { mentions: isOther ? [targetJid] : [] }
        )
    }
    
    const partnerJid = userData.fun.pasangan
    const partnerData = db.getUser(partnerJid) || {}
    const isMutual = partnerData.fun?.pasangan === targetJid
    const nama = isOther ? `@${targetJid.split('@')[0]}` : 'Tu'
    if (isMutual) {
        await m.react('💕')
        await m.reply(
            `💕 *sᴛᴀᴛᴜs ʜᴜʙᴜɴɢᴀɴ*\n\n` +
            `*${nama}* esta en una relacion con @${partnerJid.split('@')[0]}! 🥳`,
            { mentions: [targetJid, partnerJid] }
        )
    } else {
        await m.react('💭')
        await m.reply(
            `💭 *sᴛᴀᴛᴜs ʜᴜʙᴜɴɢᴀɴ*\n\n` +
            `*${nama}* esta coqueteando con @${partnerJid.split('@')[0]}\n` +
            `Estado: *En espera* 😅\n\n` +
            `Esperando respuesta...`,
            { mentions: [targetJid, partnerJid] }
        )
    }
}

export { pluginConfig as config, handler }
