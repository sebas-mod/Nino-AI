import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'inspect',
    alias: ['cekgrup', 'ceksaluran', 'groupinfo', 'channelinfo'],
    category: 'utility',
    description: 'Inspecciona la información de un grupo o canal de WhatsApp mediante un enlace',
    usage: '.inspect <enlace grupo/canal>',
    example: '.inspect https://chat.whatsapp.com/xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text?.trim()

    if (!text) {
        return m.reply(
            `🔍 *ɪɴsᴘᴇᴄᴄɪᴏɴ*\n\n` +
            `> Consulta información de un grupo o canal mediante un enlace\n\n` +
            `*ᴇᴊᴇᴍᴘʟᴏ:*\n` +
            `> \`${m.prefix}inspect https://chat.whatsapp.com/xxx\`\n` +
            `> \`${m.prefix}inspect https://whatsapp.com/channel/xxx\``
        )
    }

    const grupPattern = /chat\.whatsapp\.com\/([\w\d]*)/
    const saluranPattern = /whatsapp\.com\/channel\/([\w\d]*)/

    m.react('🔍')

    try {
        if (grupPattern.test(text)) {
            const inviteCode = text.match(grupPattern)[1]
            
            const groupInfo = await sock.groupGetInviteInfo(inviteCode)
            
            let teks = 
                `📋 *ɪɴꜰᴏʀᴍᴀᴄɪᴏɴ ᴅᴇʟ ɢʀᴜᴘᴏ*\n\n` +
                `╭┈┈⬡「 📊 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
                `┃ 📝 ɴᴏᴍʙʀᴇ: *${groupInfo.subject}*\n` +
                `┃ 🆔 ɪᴅ: \`${groupInfo.id}\`\n` +
                `┃ 📅 ᴄʀᴇᴀᴅᴏ: ${new Date(groupInfo.creation * 1000).toLocaleString('id-ID')}\n`

            if (groupInfo.owner) {
                teks += `┃ 👑 ᴄʀᴇᴀᴅᴏʀ: @${groupInfo.owner.split('@')[0]}\n`
            }

            teks += 
                `┃ 🔗 ᴘᴀᴅʀᴇ ᴠɪɴᴄᴜʟᴀᴅᴏ: ${groupInfo.linkedParent || 'Ninguno'}\n` +
                `┃ 🔒 ʀᴇsᴛʀɪɴɢɪᴅᴏ: ${groupInfo.restrict ? '✅' : '❌'}\n` +
                `┃ 📢 ᴀɴᴜɴᴄɪᴏ: ${groupInfo.announce ? '✅' : '❌'}\n` +
                `┃ 🏘️ ᴇs ᴄᴏᴍᴜɴɪᴅᴀᴅ: ${groupInfo.isCommunity ? '✅' : '❌'}\n` +
                `┃ 📣 ᴀɴᴜɴᴄɪᴏ ᴅᴇ ᴄᴏᴍᴜɴɪᴅᴀᴅ: ${groupInfo.isCommunityAnnounce ? '✅' : '❌'}\n` +
                `┃ ✅ ᴀᴘʀᴏʙᴀᴄɪᴏɴ ᴅᴇ ᴜɴɪᴏɴ: ${groupInfo.joinApprovalMode ? '✅' : '❌'}\n` +
                `┃ ➕ ᴍᴏᴅᴏ ᴀɢʀᴇɢᴀʀ ᴍɪᴇᴍʙʀᴏs: ${groupInfo.memberAddMode ? '✅' : '❌'}\n` +
                `┃ 👥 ᴘᴀʀᴛɪᴄɪᴘᴀɴᴛᴇs: ${groupInfo.participants?.length || 0}\n` +
                `╰┈┈⬡\n\n`

            if (groupInfo.desc) {
                teks += `📝 *ᴅᴇsᴄʀɪᴘᴄɪᴏɴ:*\n${groupInfo.desc}\n\n`
            }

            if (groupInfo.participants?.length > 0) {
                const admins = groupInfo.participants.filter(p => p.admin)
                if (admins.length > 0) {
                    teks += `👑 *ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀᴇs:*\n`
                    admins.forEach(a => {
                        teks += `├ @${a.id.split('@')[0]} [${a.admin}]\n`
                    })
                    teks += `╰┈┈⬡`
                }
            }

            const mentions = []
            if (groupInfo.owner) mentions.push(groupInfo.owner)
            if (groupInfo.participants) {
                groupInfo.participants.filter(p => p.admin).forEach(a => mentions.push(a.id))
            }

            m.react('✅')
            return sock.sendMessage(m.chat, { text: teks, mentions }, { quoted: m })

        } else if (saluranPattern.test(text) || text.endsWith('@newsletter') || !isNaN(text)) {
            const channelId = saluranPattern.test(text) ? text.match(saluranPattern)[1] : text
            
            const channelInfo = await sock.newsletterMsg(channelId)
            
            const teks = 
                `📺 *ɪɴꜰᴏʀᴍᴀᴄɪᴏɴ ᴅᴇʟ ᴄᴀɴᴀʟ*\n\n` +
                `╭┈┈⬡「 📊 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
                `┃ 🆔 ɪᴅ: \`${channelInfo.id}\`\n` +
                `┃ 📌 ᴇsᴛᴀᴅᴏ: ${channelInfo.state?.type || '-'}\n` +
                `┃ 📝 ɴᴏᴍʙʀᴇ: *${channelInfo.thread_metadata?.name?.text || '-'}*\n` +
                `┃ 📅 ᴄʀᴇᴀᴅᴏ: ${new Date((channelInfo.thread_metadata?.creation_time || 0) * 1000).toLocaleString('id-ID')}\n` +
                `┃ 👥 sᴜsᴄʀɪᴘᴛᴏʀᴇs: ${channelInfo.thread_metadata?.subscribers_count || 0}\n` +
                `┃ ✅ ᴠᴇʀɪꜰɪᴄᴀᴄɪᴏɴ: ${channelInfo.thread_metadata?.verification || '-'}\n` +
                `╰┈┈⬡\n\n` +
                `📝 *ᴅᴇsᴄʀɪᴘᴄɪᴏɴ:*\n${channelInfo.thread_metadata?.description?.text || 'Sin descripción'}`

            m.react('✅')
            return m.reply(teks)

        } else {
            return m.reply('❌ Solo se admiten URL de grupos o canales de WhatsApp!')
        }

    } catch (error) {
        m.react('❌')
        
        if (error.data) {
            if ([400, 406].includes(error.data)) {
                return m.reply('❌ Grupo/Canal no encontrado!')
            }
            if (error.data === 401) {
                return m.reply('❌ El bot fue expulsado de ese grupo!')
            }
            if (error.data === 410) {
                return m.reply('❌ La URL del grupo fue restablecida!')
            }
        }
        
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
