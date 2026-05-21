const pluginConfig = {
    name: 'antiremove',
    alias: ['antidelete', 'antihapus', 'ar'],
    category: 'group',
    description: 'Activa o desactiva anti borrado de mensajes en el grupo',
    usage: '.antiremove <on/off>',
    example: '.antiremove on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: false
}

async function handler(m, { sock, db }) {
    const action = (m.args || [])[0]?.toLowerCase()
    const group = db.getGroup(m.chat) || {}

    if (!action) {
        const status = group.antiremove || 'off'
        await m.reply(
            `🗑️ *AntiRemove*\n\n` +
            `> Estado: *${status === 'on' ? '✅ Aktif' : '❌ Nonactivo'}*\n\n` +
            `> \`.antiremove on/off\``
        )
        return
    }

    if (action === 'on') {
        db.setGroup(m.chat, { ...group, antiremove: 'on' })
        m.react('✅')
        await m.reply(`✅ *AntiRemove activado*\n> Los mensajes eliminados se reenviaran otra vez.`)
        return
    }

    if (action === 'off') {
        db.setGroup(m.chat, { ...group, antiremove: 'off' })
        m.react('❌')
        await m.reply(`❌ *AntiRemove desactivado*`)
        return
    }

    await m.reply(`❌ Usa \`.antiremove on\` o \`.antiremove off\``)
}

export { pluginConfig as config, handler }