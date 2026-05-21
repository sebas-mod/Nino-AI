import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'setintro',
    alias: ['setperkenalan', 'introset'],
    category: 'group',
    description: 'Establece el mensaje de intro del grupo (solo admins)',
    usage: '.setintro <mensaje>',
    example: '.setintro Selamat datang @user di @group!',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true
}

async function handler(m) {
    const db = getDatabase()
    const introText = m.fullArgs?.trim() || m.text?.trim()
    
    if (!introText) {
        return m.reply(
            `📝 *sᴇᴛ ɪɴᴛʀᴏ*\n\n` +
            `> Ingresa mensaje intro!\n\n` +
            `*Placeholder yang tersedia:*\n` +
            `> @user - Nombre pengguna\n` +
            `> @group - Nombre grupo\n` +
            `> @count - Jumlah miembro\n` +
            `> @date - Tanggal hari ini\n` +
            `> @time - Hora actual\n` +
            `> @desc - Deskripsi grupo\n` +
            `> @botname - Nombre bot\n\n` +
            `*Ejemplo:*\n` +
            `> .setintro Selamat datang @user di grupo @group! 👋`
        )
    }
    
    const groupData = db.getGroup(m.chat) || db.setGroup(m.chat)
    groupData.intro = introText
    db.setGroup(m.chat, groupData)
    db.save()
    
    await m.reply(
        `✅ *ɪɴᴛʀᴏ ᴅɪsᴀᴠᴇ!*\n` +
        `Mensaje intro grupo correctamente diubah.\n` +
        `Escribe *${m.prefix}intro* para melihat hasilnya.`
    )
}

export { pluginConfig as config, handler }