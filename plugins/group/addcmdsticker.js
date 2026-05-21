import { getQuotedStickerHash, addStickerCommand, listStickerCommands } from '../../src/lib/ourin-sticker-command.js'
import { getPlugin } from '../../src/lib/ourin-plugins.js'
const pluginConfig = {
    name: 'addcmdsticker',
    alias: ['addstickercmd', 'setsticker', 'stickeradd'],
    category: 'group',
    description: 'Convierte un sticker en atajo de comando',
    usage: '.addcmdsticker <comando> (reply sticker)',
    example: '.addcmdsticker menu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const commandName = args[0]
    
    // Validasi comando name
    if (!commandName) {
        const existingCmds = listStickerCommands()
        
        let txt = `🖼️ *sᴛɪᴄᴋᴇʀ ᴛᴏ ᴄᴏᴍᴍᴀɴᴅ*\n\n`
        txt += `> Responde a un sticker y escribe el comando que quieres usar como atajo.\n\n`
        txt += `*Ejemplo:*\n`
        txt += `> Responde a un sticker y luego escribe:\n`
        txt += `> \`.addcmdsticker menu\`\n\n`
        
        if (existingCmds.length > 0) {
            txt += `╭┈┈⬡「 📋 *ᴀᴋᴛɪꜰ* 」\n`
            for (const cmd of existingCmds.slice(0, 10)) {
                txt += `┃ 🖼️ → \`${cmd.command}\`\n`
            }
            if (existingCmds.length > 10) {
                txt += `┃ ... dan ${existingCmds.length - 10} lainnya\n`
            }
            txt += `╰┈┈┈┈┈┈┈┈⬡`
        }
        
        return m.reply(txt)
    }
    
    // Validasi reply sticker
    if (!m.quoted) {
        return m.reply('⚠️ *Responde al sticker que quieres convertir en comando!')
    }
    
    const stickerHash = getQuotedStickerHash(m)
    if (!stickerHash) {
        return m.reply('⚠️ El mensaje respondido no es un *sticker*!')
    }
    
    // Validasi comando exists
    const cleanCmd = commandName.toLowerCase().replace(/^\./, '')
    const plugin = getPlugin(cleanCmd)
    
    if (!plugin) {
        return m.reply(
            `❌ Command \`${cleanCmd}\` no se encontro!\n\n` +
            `> Asegurate de que el comando que quieres usar como atajo sea valido.`
        )
    }
    
    // Add sticker comando
    const success = addStickerCommand(stickerHash, cleanCmd, m.sender)
    
    if (success) {
        await m.react('✅')
        await m.reply(
            `✅ *sᴛɪᴄᴋᴇʀ ᴄᴏᴍᴍᴀɴᴅ ᴅɪᴛᴀᴍʙᴀʜᴋᴀɴ*\n\n` +
            `> 🖼️ Sticker → \`.${cleanCmd}\`\n\n` +
            `_Kirim sticker tersebut para menjalankan comando!_`
        )
    } else {
        await m.reply('❌ Fallido menyimpan sticker comando!')
    }
}

export { pluginConfig as config, handler }