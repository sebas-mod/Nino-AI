import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import fs from 'fs'
import path from 'path'
const pluginConfig = {
    name: 'setownertype',
    alias: ['ownertype', 'ownervariant', 'ownerstyle'],
    category: 'owner',
    description: 'Configurar variante visual del mensaje de owner',
    usage: '.setownertype',
    example: '.setownertype',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const VARIANTS = {
    1: { name: 'Current Design', desc: 'Tampilan default saat ini' },
    2: { name: 'Carousel Cards', desc: 'Tarjeta carousel con foto del owner' },
    3: { name: 'Multiple Contact', desc: 'Enviar contact card de todos los owners' }
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const variant = args[0]?.toLowerCase()
    const current = db.setting('ownerType') || 1
    
    if (variant && /^v?[1-3]$/.test(variant)) {
        const id = parseInt(variant.replace('v', ''))
        db.setting('ownerType', id)
        await db.save()
        
        await m.reply(
            `✅ Owner type diubah ke *V${id}*\n\n` +
            `> *${VARIANTS[id].name}*\n` +
            `> _${VARIANTS[id].desc}_`
        )
        return
    }
    
    const buttons = []
    for (const [id, val] of Object.entries(VARIANTS)) {
        const mark = parseInt(id) === current ? ' ✓' : ''
        buttons.push({
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: `V${id}${mark} - ${val.name}`,
                id: `${m.prefix}setownertype v${id}`
            })
        })
    }
    
    await sock.sendMessage(m.chat, {
        text: `🎨 *sᴇᴛ ᴏᴡɴᴇʀ ᴛʏᴘᴇ*\n\n> Tipo actual: *V${current}*\n> _${VARIANTS[current].name}_\n\n> Elige variante de owner:`,
        footer: config.bot?.name || 'Nino AI',
        contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardingScore: 999
        },
        interactiveButtons: buttons
    }, { quoted: m })
}

export { pluginConfig as config, handler }