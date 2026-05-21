import { pixa } from '../../src/scraper/removebackground.js'
import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'removebg',
    alias: ['rmbg', 'nobg', 'hapusbg'],
    category: 'tools',
    description: 'Elimina el fondo de una imagen',
    usage: '.removebg (responde a una imagen)',
    example: '.removebg',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
};

async function handler(m, { sock }) {
    try {
        const isImage = m.isImage || (m.quoted && m.quoted.isImage);
        if (!isImage) {
            return await m.reply('❌ *ɢᴀᴍʙᴀʀ ᴅɪʙᴜᴛᴜʜᴋᴀɴ*\n\n> Responde o envía una imagen con el caption .removebg');
        }
        
        await m.react('🕕')
        
        let mediaBuffer;
        if (m.isImage && m.download) {
            mediaBuffer = await m.download();
        } else if (m.quoted && m.quoted.isImage && m.quoted.download) {
            mediaBuffer = await m.quoted.download();
        } else {
            return await m.reply('❌ No se pudo descargar la imagen');
        }
        
        if (!mediaBuffer || !Buffer.isBuffer(mediaBuffer)) {
            return await m.reply('❌ El buffer de imagen no es válido');
        }
        const pathnya = path.join(process.cwd(), 'temp', `rmbg_${Date.now()}.jpg`);
        fs.writeFileSync(pathnya, mediaBuffer);
        const result = await pixa(pathnya);
        
        await sock.sendMessage(m.chat, {
            image: result,
            caption: `✅ *ʙᴀᴄᴋɢʀᴏᴜɴᴅ ᴅɪʜᴀᴘᴜs*\n\n> Fondo de la imagen eliminado correctamente`
        }, { quoted: m });
        try {
            fs.unlinkSync(pathnya);
        } catch (e) {}
    } catch (error) {
        console.error('[RemoveBG Error]', error);
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }