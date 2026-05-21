const pluginConfig = {
    name: 'delete',
    alias: ['del', 'hapus', 'd'],
    category: 'group',
    description: 'Elimina un mensaje respondiendolo',
    usage: '.delete (reply mensaje)',
    example: '.delete',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: false,
    isBotAdmin: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (!m.quoted) {
        return m.reply('⚠️ *Responde al mensaje que quieres eliminar!*')
    }
    
    const quotedSender = m.quoted.sender || m.quoted.key?.participant
    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    const isOwnMessage = m.quoted.key?.fromMe || quotedSender === m.sender
    const isBotMessage = quotedSender === botJid || m.quoted.key?.fromMe
    
    if (!isOwnMessage && !isBotMessage) {
        if (!m.isBotAdmin) {
            return m.reply('⚠️ *Bot harus jadi admin para eliminar mensaje orang lain!*')
        }
        if (!m.isAdmin && !m.isOwner) {
            return m.reply('⚠️ *Solo admins yang bisa hapus mensaje orang lain!*')
        }
    }
    
    try {
        const key = {
            remoteJid: m.chat,
            id: m.quoted.key.id,
            fromMe: m.quoted.key.fromMe,
            participant: quotedSender
        }
        
        await sock.sendMessage(m.chat, { delete: key })
        await m.react('✅')
        
    } catch (err) {
        if (err.message?.includes('not found') || err.message?.includes('forbidden')) {
            await m.reply('❌ *Fallido eliminar!*\n> Mensaje mungkin ya eliminado o terlalu lama.')
        } else {
            await m.react('❌')
        }
    }
}

export { pluginConfig as config, handler }