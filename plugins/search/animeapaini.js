import axios from 'axios'
import config from '../../config.js'
import { downloadContentFromMessage } from 'ourin'
import FormData from 'form-data'
import te from '../../src/lib/ourin-error.js'
const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-OurinMD'

const pluginConfig = {
    name: 'animeapaini',
    alias: ['whatanime', 'animesearch', 'sauceanime', 'searchanime'],
    category: 'search',
    description: 'Identificar anime desde una imagen/captura',
    usage: '.animeapaini (responde una imagen)',
    example: '.animeapaini',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}


async function uploadToTempfiles(buffer) {
    const form = new FormData()
    form.append('file', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' })
    
    const response = await axios.post('https://c.termai.cc/api/upload?key=AIzaBj7z2z3xBjsk', form, {
        headers: form.getHeaders(),
        timeout: 30000
    })
    
    if (response.data?.files?.[0]?.url) {
        return response.data
    }
    throw new Error('Error al subir la imagen')
}


async function handler(m, { sock }) {
    let imageBuffer = null
    let imageMsg = null
    
    if (m.isImage && m.message?.imageMessage) {
        imageMsg = m.message.imageMessage
    } else if (m.quoted?.isImage && m.quoted?.message?.imageMessage) {
        imageMsg = m.quoted.message.imageMessage
    } else if (m.quoted?.isImage) {
        try {
            imageBuffer = await m.quoted.download()
        } catch (e) {}
    }
    
    if (m.isVideo || m.quoted?.isVideo) {
        return m.reply(`❌ *ɴᴏ ᴄᴏᴍᴘᴀᴛɪʙʟᴇ*\n\n> Solo se admiten imágenes/capturas\n> Los videos no se pueden procesar\n\n\`Responde o envía una imagen con el texto ${m.prefix}animeapaini\``)
    }
    
    if (!imageMsg && !imageBuffer) {
        return m.reply(
            `🔍 *ᴀɴɪᴍᴇ ᴀᴘᴀ ɪɴɪ?*\n\n` +
            `> Envía una imagen con el texto:\n` +
            `> \`${m.prefix}animeapaini\`\n\n` +
            `> O responde una imagen con:\n` +
            `> \`${m.prefix}animeapaini\`\n\n` +
            `⚠️ *Nota:* No se admiten videos, solo imágenes/capturas`
        )
    }
    
    m.react('🔍')
    
    try {
        if (!imageBuffer && imageMsg) {
            const stream = await downloadContentFromMessage(imageMsg, 'image')
            let chunks = []
            for await (const chunk of stream) {
                chunks.push(chunk)
            }
            imageBuffer = Buffer.concat(chunks)
        }
        
        if (!imageBuffer || imageBuffer.length < 100) {
            m.react('❌')
            return m.reply(`❌ No se pudo obtener la imagen. Intenta enviarla de nuevo.`)
        }
        
        await m.react('🕕')
        
        const imageUrl = await uploadToTempfiles(imageBuffer)
        
        const res = await axios.get(`https://api.neoxr.eu/api/whatanime?url=${encodeURIComponent(imageUrl)}&apikey=${NEOXR_APIKEY}`, {
            timeout: 60000
        })
        
        if (!res.data?.status || !res.data?.data) {
            m.react('❌')
            return m.reply(`❌ Anime no encontrado. Intenta con una captura más clara.`)
        }
        
        const d = res.data.data
        
        const similarity = ((d.similarity || 0) * 100).toFixed(2)
        
        const formatTime = (seconds) => {
            if (!seconds) return '00:00'
            const mins = Math.floor(seconds / 60)
            const secs = Math.floor(seconds % 60)
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        }
        
        const filename = d.filename || 'Desconocido'
        const animeName = filename.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').replace(/\.mp4|\.mkv|\.avi/gi, '').trim() || 'Anime desconocido'
        
        const caption = `🔍 *ᴀɴɪᴍᴇ ᴀᴘᴀ ɪɴɪ?*\n\n` +
            `🎬 *Anime:* ${animeName}\n` +
            `📺 *Episodio:* ${d.episode || 'Película/OVA'}\n` +
            `🆔 *AniList ID:* ${d.anilist || '-'}\n\n` +
            `⏱️ *Tiempo:*\n` +
            `  ◦ Desde: \`${formatTime(d.from)}\`\n` +
            `  ◦ Hasta: \`${formatTime(d.to)}\`\n\n` +
            `📊 *Similitud:* ${similarity}%\n\n` +
            `🔗 https://anilist.co/anime/${d.anilist || ''}`
        
        m.react('✅')
        
        if (d.image) {
            await sock.sendMedia(m.chat, d.image, caption, m, {
                type: 'image'
            })
        } else {
            await m.reply(caption)
        }
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
