import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
import { bratVid } from 'brat-canvas/video'
import fs from 'fs'
import path from 'path'
import os from 'os'

const pluginConfig = {
    name: 'bratvid',
    alias: ['bratgif', 'bratvideo'],
    category: 'sticker',
    description: 'Crea un sticker brat animado',
    usage: '.bratvid <texto>',
    example: '.bratvid Hola a todos',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')
    if (!text) {
        return m.reply(`🎬 *ʙʀᴀᴛ ᴀɴɪᴍᴀᴛᴇᴅ*\n\n> Ingresa el texto\n\n\`Ejemplo: ${m.prefix}bratvid Hola a todos\``)
    }
    
    m.react('🕕')
    
    try {
        const tempFile = path.join(os.tmpdir(), `brat-${Date.now()}.webp`)
        const url = await bratVid(text, {
            outputFormat: 'mp4',
        })
        await fs.promises.writeFile(tempFile, url)
        await sock.sendVideoAsSticker(m.chat, tempFile, m, {
            packname: config.sticker.packname,
            author: config.sticker.author
        })
        await fs.promises.unlink(tempFile)
        m.react('✅')
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }