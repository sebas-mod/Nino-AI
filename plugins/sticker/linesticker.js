import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'linesticker',
    alias: ['linepack', 'line'],
    category: 'sticker',
    description: 'Descarga un pack de stickers de LINE',
    usage: '.linesticker <url>',
    example: '.linesticker https://store.line.me/stickershop/product/9801/en',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 25,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = m.args?.[0]?.trim()
    
    if (!url || !url.includes('store.line.me')) {
        return m.reply(
            `🎨 *ʟɪɴᴇ sᴛɪᴄᴋᴇʀ ᴘᴀᴄᴋ*\n\n` +
            `> Descarga un pack de stickers de LINE\n\n` +
            `╭┈┈⬡「 📋 *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ* 」\n` +
            `┃ ${m.prefix}linesticker <url>\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `*ᴄᴀʀᴀ ᴅᴀᴘᴀᴛ ᴜʀʟ:*\n` +
            `> 1. Abre https://store.line.me\n` +
            `> 2. Elige un pack de stickers\n` +
            `> 3. Copia la URL del navegador\n\n` +
            `*ᴄᴏɴᴛᴏʜ:*\n` +
            `> ${m.prefix}linesticker https://store.line.me/stickershop/product/9801/en`
        )
    }
    
    await m.react('🕕')
    
    try {
        const apikey = config.APIkey?.neoxr
        if (!apikey) {
            await m.react('❌')
            return m.reply(`❌ No se encontro la API Key de Neoxr en la config!`)
        }
        
        const apiUrl = `https://api.neoxr.eu/api/linesticker?url=${encodeURIComponent(url)}&apikey=${apikey}`
        const res = await axios.get(apiUrl, { timeout: 60000 })
        
        if (!res.data?.status || !res.data?.data) {
            await m.react('❌')
            return m.reply(`❌ No se pudieron obtener stickers desde esa URL!`)
        }
        
        const data = res.data.data
        const title = data.title || 'LINE Sticker'
        const author = data.author || 'Desconocido'
        const isAnimated = data.animated || false
        
        const stickerUrls = isAnimated && data.sticker_animation_url?.length
            ? data.sticker_animation_url
            : data.sticker_url || []
        
        if (!stickerUrls.length) {
            await m.react('❌')
            return m.reply(`❌ No se encontraron stickers!`)
        }
        
        await m.reply(
            `🎨 *ʟɪɴᴇ sᴛɪᴄᴋᴇʀ ᴘᴀᴄᴋ*\n\n` +
            `╭┈┈⬡「 📦 *ɪɴꜰᴏ* 」\n` +
            `┃ 📝 *Titulo:* ${title}\n` +
            `┃ 👤 *Autor:* ${author}\n` +
            `┃ 🎬 *Animado:* ${isAnimated ? 'Si' : 'No'}\n` +
            `┃ 📊 *Total:* ${stickerUrls.length}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> 🕕 Enviando stickers...`
        )
        
        const maxStickers = Math.min(stickerUrls.length, 10)
        const packname = title
        const packAuthor = author
        
        let sent = 0
        for (let i = 0; i < maxStickers; i++) {
            try {
                const response = await axios.get(stickerUrls[i], {
                    responseType: 'arraybuffer',
                    timeout: 30000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                })
                const buffer = Buffer.from(response.data)
                
                if (isAnimated) {
                    await sock.sendVideoAsSticker(m.chat, buffer, m, { packname, author: packAuthor })
                } else {
                    await sock.sendImageAsSticker(m.chat, buffer, m, { packname, author: packAuthor })
                }
                sent++
                await new Promise(r => setTimeout(r, 600))
            } catch (e) {
                console.error('[LineSticker] Sticker error:', e.message)
            }
        }
        
        if (sent > 0) {
            await m.react('✅')
            await m.reply(`✅ Enviados correctamente ${sent}/${stickerUrls.length} stickers`)
        } else {
            await m.react('☢')
            await m.reply(`❌ No se pudo enviar el sticker`)
        }
        
    } catch (error) {
        console.error('[LineSticker] Error:', error.message)
        await m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }