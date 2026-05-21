import { getQuotedStickerHash, deleteStickerCommand, listStickerCommands, findByCommand } from '../../src/lib/ourin-sticker-command.js'
const pluginConfig = {
    name: 'delstickercmd',
    alias: ['delcmdsticker', 'removesticker', 'unsticker'],
    category: 'group',
    description: 'Elimina un comando de sticker',
    usage: '.delstickercmd <comando> o reply sticker',
    example: '.delstickercmd menu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const commandName = args[0]
    if (!commandName && !m.quoted) {
        const existingCmds = listStickerCommands()
        if (existingCmds.length === 0) {
            return m.reply(
                `🖼️ *sᴛɪᴄᴋᴇʀ ᴄᴏᴍᴍᴀɴᴅs*\n\n` +
                `> No hay sticker comando yang terlista.\n` +
                `> Tambahkan con \`.addcmdsticker\``
            )
        }
        
        let txt = `🖼️ *sᴛɪᴄᴋᴇʀ ᴄᴏᴍᴍᴀɴᴅs*\n\n`
        txt += `╭┈┈⬡「 📋 *ᴅᴀꜰᴛᴀʀ* 」\n`
        
        for (const cmd of existingCmds) {
            txt += `┃ 🖼️ → \`.${cmd.command}\`\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        
        txt += `*Hapus con:*\n`
        txt += `> \`.delstickercmd <comando>\`\n`
        txt += `> o reply sticker + \`.delstickercmd\``
        
        return m.reply(txt)
    }
    
    let deleted = false
    let deletedCmd = ''
    if (m.quoted) {
        const stickerHash = getQuotedStickerHash(m)
        if (stickerHash) {
            const success = deleteStickerCommand(stickerHash)
            if (success) {
                deleted = true
                deletedCmd = 'sticker yang di-reply'
            }
        }
    }
    if (!deleted && commandName) {
        const cleanCmd = commandName.toLowerCase().replace(/^\./, '')
        const found = findByCommand(cleanCmd)
        
        if (found) {
            const success = deleteStickerCommand(found.hash)
            if (success) {
                deleted = true
                deletedCmd = cleanCmd
            }
        } else {
            return m.reply(
                `❌ Sticker comando \`${cleanCmd}\` no se encontro!\n\n` +
                `> Ver lista con \`.delstickercmd\``
            )
        }
    }
    
    if (deleted) {
        await m.react('✅')
        await m.reply(
            `✅ *sᴛɪᴄᴋᴇʀ ᴄᴏᴍᴍᴀɴᴅ ᴅɪʜᴀᴘᴜs*\n\n` +
            `> 🗑️ \`${deletedCmd}\` telah eliminado.`
        )
    } else {
        await m.reply(
            `❌ Fallido eliminar!\n\n` +
            `> Reply sticker yang ingin eliminado, o\n` +
            `> Escribe nama comando: \`.delstickercmd menu\``
        )
    }
}

export { pluginConfig as config, handler }