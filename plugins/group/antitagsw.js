const pluginConfig = {
    name: 'antitagsw',
    alias: ['antitag', 'antistatustag'],
    category: 'group',
    description: 'Activa o desactiva anti etiquetas de estado en el grupo',
    usage: '.antitagsw <on/off>',
    example: '.antitagsw on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    const groupId = m.chat
    const group = db.getGroup(groupId) || {}

    if (!action) {
        const status = group.antitagsw || 'off'

        await m.reply(
            `📢 *ᴀɴᴛɪᴛᴀɢsᴡ sᴇᴛᴛɪɴɢs*\n\n` +
            `> Estado: *${status === 'on' ? '✅ Aktif' : '❌ Nonactivo'}*\n\n` +
            `> Esta funcion elimina mensajes que etiquetan estados\n` +
            `> (groupStatusMentionMessage)\n\n` +
            `\`\`\`━━━ ᴘɪʟɪʜᴀɴ ━━━\`\`\`\n` +
            `> \`${m.prefix}antitagsw on\` → Activar\n` +
            `> \`${m.prefix}antitagsw off\` → Desactivar`
        )
        return
    }

    if (action === 'on') {
        db.setGroup(groupId, { ...group, antitagsw: 'on' })
        await m.reply(
            `✅ *ᴀɴᴛɪᴛᴀɢsᴡ ᴀᴋᴛɪꜰ*\n\n` +
            `> Anti tag status correctamente activado!\n` +
            `> Los mensajes que etiqueten estados se eliminaran automaticamente.`
        )
        return
    }

    if (action === 'off') {
        db.setGroup(groupId, { ...group, antitagsw: 'off' })
        await m.reply(
            `❌ *ᴀɴᴛɪᴛᴀɢsᴡ ɴᴏɴᴀᴋᴛɪꜰ*\n\n` +
            `> Anti tag status correctamente desactivado.`
        )
        return
    }

    await m.reply(
        `❌ *ᴘɪʟɪʜᴀɴ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n` +
        `> Usa: on o off`
    )
}

export { pluginConfig as config, handler }