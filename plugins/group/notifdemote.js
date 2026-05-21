const pluginConfig = {
    name: 'notifdemote',
    alias: [],
    category: 'group',
    description: 'Activa o desactiva notificaciones cuando alguien sea degradado de admin',
    usage: '.notifdemote on/off',
    example: '.notifdemote on',
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
        const status = group.notifDemote === true ? '✅ Aktif' : '❌ Nonactivo'
        return m.reply(`👤 *ɴᴏᴛɪꜰ ᴅᴇᴍᴏᴛᴇ*\n\n> Estado: ${status}\n\n*Uso:*\n\`${m.prefix}notifdemote on\` - Activar\n\`${m.prefix}notifdemote off\` - Desactivar`)
    }
    
    if (args === 'on') {
        group.notifDemote = true
        db.setGroup(m.chat, group)
        return m.reply(`✅ *ɴᴏᴛɪꜰ ᴅᴇᴍᴏᴛᴇ ᴅɪᴀᴋᴛɪꜰᴋᴀɴ*`)
    }
    
    if (args === 'off') {
        group.notifDemote = false
        db.setGroup(m.chat, group)
        return m.reply(`❌ *ɴᴏᴛɪꜰ ᴅᴇᴍᴏᴛᴇ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ*`)
    }
}

export { pluginConfig as config, handler }