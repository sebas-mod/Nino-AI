import * as pakasir from '../../src/lib/ourin-pakasir.js'
import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'botmode',
    alias: ['setmode', 'mode'],
    category: 'owner',
    description: 'Configurar modo del bot (md/cpanel/store/pushkontak/all)',
    usage: '.botmode <mode> [--autoorder]',
    example: '.botmode store --autoorder',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}
const VALID_MODES = ['md', 'cpanel', 'store', 'pushkontak', 'all']
const MODE_DESCRIPTIONS = {
    md: 'Modo por defecto, todas las funciones excepto panel/store/pushkontak',
    cpanel: 'Mode panel, main + group + sticker + owner + tools + panel',
    store: 'Mode store, main + group + sticker + owner + store',
    pushkontak: 'Mode pushkontak, main + group + sticker + owner + pushkontak',
    all: 'Mode full, se puede acceder a TODAS las funciones de todos los modos'
}
async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const mode = (args[0] || '').toLowerCase()
    const flags = args.slice(1).map(f => f.toLowerCase())
    const isAutoorder = false
    const globalMode = db.setting('botMode') || 'md'
    const groupData = m.isGroup ? (db.getGroup(m.chat) || {}) : {}
    const groupMode = groupData.botMode || null
    if (!mode) {
        const autoorderStatus = groupData.storeConfig?.autoorder ? '✅ ON' : '❌ OFF'
        let txt = `╭┈┈⬡「 🤖 *ʙᴏᴛ ᴍᴏᴅᴇ* 」
┃ ㊗ ɢʟᴏʙᴀʟ: *${globalMode.toUpperCase()}*
${m.isGroup ? `┃ ㊗ ɢʀᴜᴘ: *${(groupMode || 'INHERIT').toUpperCase()}*\n` : ''}${m.isGroup && (groupMode === 'store' || (!groupMode && globalMode === 'store')) ? `┃ ㊗ ᴀᴜᴛᴏᴏʀᴅᴇʀ: *${autoorderStatus}*\n` : ''}╰┈┈⬡
╭┈┈⬡「 📋 *ᴀᴠᴀɪʟᴀʙʟᴇ ᴍᴏᴅᴇs* 」
`
        const currentMode = m.isGroup ? (groupMode || globalMode) : globalMode
        for (const [key, desc] of Object.entries(MODE_DESCRIPTIONS)) {
            const isActive = key === currentMode ? ' ✅' : ''
            txt += `┃ ㊗ *${key.toUpperCase()}*${isActive}\n`
            txt += `┃   ${desc}\n`
        }
        txt += `╰┈┈⬡
*ꜰʟᴀɢ sᴛᴏʀᴇ:*
> \`${m.prefix}botmode store\` - Manual order
> \`${m.prefix}botmode store --autoorder\` - Auto payment
> \`${m.prefix}botmode md\` → Mode default
> \`${m.prefix}botmode all\` → Todas las funciones`
        await m.reply(txt)
        return
    }
    if (!VALID_MODES.includes(mode)) {
        return m.reply(
            `❌ *ᴍᴏᴅᴇ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n` +
            `> Mode tersedia: \`${VALID_MODES.join(', ')}\``
        )
    }
    console.log('[Botmode] Debug:', { args: m.args, mode, flags, isAutoorder })
    if (m.isGroup) {
        const newGroupData = {
            ...groupData,
            botMode: mode
        }
        if (mode === 'store') {
            newGroupData.storeConfig = {
                ...(groupData.storeConfig || {}),
                autoorder: isAutoorder,
                products: groupData.storeConfig?.products || []
            }
        }
        db.setGroup(m.chat, newGroupData)
    } else {
        db.setting('botMode', mode)
    }
    db.save()
    await m.react('✅')
    let extraInfo = ''
    if (mode === 'store' && m.isGroup) {
        if (isAutoorder) {
            try {
                if (!pakasir.isEnabled()) {
                    extraInfo = `\n\n⚠️ *Pakasir aun no esta configurado!*\n> Set di config.js: pakasir.slug & pakasir.apiKey`
                } else {
                    extraInfo = `\n\n✅ *Autoorder activo!*\n> Pago automatico via Pakasir`
                }
            } catch {
                extraInfo = `\n\n⚠️ *Modulo Pakasir no encontrado*`
            }
        } else {
            extraInfo = `\n\n📋 *Manual mode*\n> Admin perlu confirm order manual`
        }
    }
    await m.reply(
        `✅ *ᴍᴏᴅᴇ ᴅɪᴜʙᴀʜ*\n\n` +
        `> Mode: *${mode.toUpperCase()}*\n` +
        `> ${MODE_DESCRIPTIONS[mode]}\n` +
        (mode === 'store' && m.isGroup ? `> Autoorder: *${isAutoorder ? 'ON' : 'OFF'}*` : '') +
        extraInfo +
        `\n\n` +
        (m.isGroup ? `> _El modo de este grupo tambien fue cambiado._` : `> _Modo global cambiado._`)
    )
    console.log(`[BotMode] Changed to ${mode.toUpperCase()} by ${m.pushName} (${m.sender})`)
}
export { pluginConfig as config, handler, VALID_MODES, MODE_DESCRIPTIONS }