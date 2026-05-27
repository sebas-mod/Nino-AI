const pluginConfig = {
    name: ['star', 'bintang'],
    alias: [],
    category: 'owner',
    description: 'Poner/quitar estrella a un mensaje',
    usage: '.star (responde a un mensaje) o .star hapus (responde a un mensaje)',
    example: '.star',
    isOwner: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (!m.quoted) {
        return m.reply(
            '⭐ *sᴛᴀʀ ᴍᴇssᴀɢᴇ*\n\n' +
            '> `.star` (responde a un mensaje) — Beri bintang\n' +
            '> `.star hapus` (responde a un mensaje) — Hapus bintang'
        )
    }

    const unstar = m.args[0]?.toLowerCase() === 'hapus' || m.args[0]?.toLowerCase() === 'unstar'
    const key = m.quoted.key

    try {
        await sock.chatModify({
            star: {
                messages: [{ id: key.id, fromMe: key.fromMe }],
                star: !unstar
            }
        }, m.chat)

        await m.react('⭐')
        return m.reply(
            unstar
                ? '❌ *Bintang eliminado dari mensaje*'
                : '⭐ *Mensaje marcado con estrella*'
        )
    } catch (err) {
        return m.reply(`❌ Fallidos: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
