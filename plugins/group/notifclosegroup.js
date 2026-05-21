const pluginConfig = {
    name: 'notifclosegroup',
    alias: ['notifclose'],
    category: 'group',
    description: 'Activa o desactiva notificaciones cuando se cierre el grupo',
    usage: '.notifclosegroup on/off',
    example: '.notifclosegroup on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock, db }) {
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(`❌ Solo admins grupo yang bisa menggunse va a fitur ini`)
    }
    
    const args = m.args[0]?.toLowerCase()
    const group = db.getGroup(m.chat) || {}
    
    if (!['on', 'off'].includes(args)) {
        const status = group.notifCloseGroup === true ? '✅ Aktif' : '❌ Nonactivo'
        return m.reply(`🔒 *ɴᴏᴛɪꜰ ᴄʟᴏsᴇ ɢʀᴏᴜᴘ*\n\n> Estado: ${status}\n\n*Uso:*\n\`${m.prefix}notifclosegroup on\` - Activar\n\`${m.prefix}notifclosegroup off\` - Desactivar`)
    }
    
    if (args === 'on') {
        group.notifCloseGroup = true
        db.setGroup(m.chat, group)
        return m.reply(`✅ *ɴᴏᴛɪꜰ ᴄʟᴏsᴇ ɢʀᴏᴜᴘ ᴅɪᴀᴋᴛɪꜰᴋᴀɴ*`)
    }
    
    if (args === 'off') {
        group.notifCloseGroup = false
        db.setGroup(m.chat, group)
        return m.reply(`❌ *ɴᴏᴛɪꜰ ᴄʟᴏsᴇ ɢʀᴏᴜᴘ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ*`)
    }
}

export { pluginConfig as config, handler }