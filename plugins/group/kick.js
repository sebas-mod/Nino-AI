import { findParticipantByNumber } from '../../src/lib/ourin-lid.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'kick',
    alias: ['remove', 'tendang'],
    category: 'group',
    description: 'Expulsa miembros del grupo',
    usage: '.kick @user',
    example: '.kick @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    let targetJid = null

    if (m.quoted) {
        targetJid = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetJid = m.mentionedJid[0]
    }

    if (!targetJid) {
        await m.reply(
            `❌ *ᴛᴀʀɢᴇᴛ ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ*\n\n` +
            `> Reply mensaje user o mention!\n` +
            `> Ejemplo: \`${m.prefix}kick @user\``
        )
        return
    }

    const botNumber = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    const targetNumber = targetJid.replace(/@.*$/, '')

    if (targetJid === botNumber || targetNumber === botNumber.replace(/@.*$/, '')) {
        await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> No se puede kick bot sendiri!`)
        return
    }

    if (targetJid === m.sender) {
        await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> No se puede kick diri sendiri!`)
        return
    }

    try {
        const groupMeta = m.groupMetadata
        const targetParticipant = findParticipantByNumber(groupMeta.participants, targetJid)
        
        if (!targetParticipant) {
            await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> User no se encontro en grupo!`)
            return
        }
        
        if (targetParticipant.admin) {
            await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> No se puede kick admin grupo!`)
            return
        }
        
        await sock.groupParticipantsUpdate(m.chat, [targetParticipant.id], 'remove')

        await m.reply(`✅ @${targetNumber} telah dikeluarkan de grupo ini.`, { mentions: [targetJid] })

    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }