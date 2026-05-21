import * as pakasir from '../../src/lib/ourin-pakasir.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'botmode',
    alias: ['setmode', 'mode'],
    category: 'group',
    description: 'Configura el modo del bot para este grupo',
    usage: '.botmode <md/cpanel/pushkontak/store/otp/all>',
    example: '.botmode store',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const MODES = {
    md: {
        name: 'Multi-Device',
        desc: 'Mode default con semua fitur standar',
        allowedCategories: null,
        excludeCategories: ['cpanel', 'pushkontak', 'store']
    },
    all: {
        name: 'All Features',
        desc: 'Se puede acceder a todas las funciones de todos los modos',
        allowedCategories: null,
        excludeCategories: null
    },
    cpanel: {
        name: 'CPanel Pterodactyl',
        desc: 'Mode khusus para panel server',
        allowedCategories: ['main', 'group', 'sticker', 'owner', 'tools', 'panel'],
        excludeCategories: null
    },
    pushkontak: {
        name: 'Push Kontak',
        desc: 'Modo especial para enviar contactos a miembros',
        allowedCategories: ['owner', 'main', 'group', 'sticker', 'pushkontak'],
        excludeCategories: null
    },
    store: {
        name: 'Store/Toko',
        desc: 'Mode khusus para toko online',
        allowedCategories: ['main', 'group', 'sticker', 'owner', 'store'],
        excludeCategories: null
    },
    otp: {
        name: 'OTP Service',
        desc: 'Mode layanan OTP otomatis',
        allowedCategories: ['main', 'group', 'sticker', 'owner'],
        excludeCategories: null
    }
}

function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const mode = (args[0] || '').toLowerCase()
    const flags = args.slice(1).map(f => f.toLowerCase())

    const groupData = db.getGroup(m.chat) || {}
    const currentMode = groupData.botMode || 'md'

    if (!mode) {
        let modeList = ''
        for (const [key, val] of Object.entries(MODES)) {
            const isCurrent = key === currentMode ? ' ⬅️' : ''
            modeList += `┃ \`${m.prefix}botmode ${key}\`${isCurrent}\n`
            modeList += `┃ └ ${val.desc}\n`
        }

        const autoorderStatus = groupData.storeConfig?.autoorder ? '✅ ON' : '❌ OFF'

        return m.reply(
            `🔧 *ʙᴏᴛ ᴍᴏᴅᴇ*\n\n` +
            `> Mode saat ini: *${currentMode.toUpperCase()}* (${MODES[currentMode]?.name || 'Unknown'})\n` +
            (currentMode === 'store' ? `> Autoorder: *${autoorderStatus}*\n` : '') +
            `\n╭─「 📋 *ᴘɪʟɪʜᴀɴ* 」\n` +
            `${modeList}` +
            `╰───────────────\n\n` +
            `*ꜰʟᴀɢ sᴛᴏʀᴇ:*\n` +
            `> \`${m.prefix}botmode store\` - Manual order\n` +
            `> \`${m.prefix}botmode store --autoorder\` - Auto payment\n\n` +
            `> _Configuracion por grupo_`
        )
    }

    if (!Object.keys(MODES).includes(mode)) {
        return m.reply(`❌ Mode no valido. Eligean: \`${Object.keys(MODES).join(', ')}\``)
    }

    const isAutoorder = false

    const newGroupData = {
        ...groupData,
        botMode: mode
    }

    if (mode === 'store') {
        let pakasirEnabled = false
        try {

            pakasirEnabled = pakasir.isEnabled()
        } catch (e) {}

        if (isAutoorder && !pakasirEnabled) {
            return m.reply(
                `⚠️ *ᴀᴜᴛᴏᴏʀᴅᴇʀ ᴛɪᴅᴀᴋ ʙɪsᴀ ᴅɪᴀᴋᴛɪꜰᴋᴀɴ*\n\n` +
                `> Pakasir aun no esta configurado!\n\n` +
                `*ᴄᴀʀᴀ sᴇᴛᴜᴘ:*\n` +
                `1. Buka \`config.js\`\n` +
                `2. Set \`pakasir.slug\` dan \`pakasir.apiKey\`\n` +
                `3. Restart bot\n\n` +
                `> O usa el modo manual:\n` +
                `\`${m.prefix}botmode store\``
            )
        }

        newGroupData.storeConfig = {
            ...(groupData.storeConfig || {}),
            autoorder: isAutoorder,
            products: groupData.storeConfig?.products || []
        }
    }

    db.setGroup(m.chat, newGroupData)
    db.save()

    m.react('✅')

    let extraInfo = ''
    if (mode === 'store') {
        const products = newGroupData.storeConfig?.products || []
        if (isAutoorder) {
            extraInfo = `\n\n✅ *Autoorder activo!*\n` +
                `> Pembayaran otomatis via Pakasir\n` +
                `> Product: \`${products.length}\` item`
        } else {
            extraInfo = `\n\n📋 *Manual mode*\n` +
                `> Admin perlu confirm order manual\n` +
                `> Product: \`${products.length}\` item\n\n` +
                `*ᴘᴀɴᴅᴜᴀɴ:*\n` +
                `> \`${m.prefix}addprod <kode> <harga> <nama>\`\n` +
                `> \`${m.prefix}listprod\` - Ver produk`
        }
    }

    return m.reply(
        `✅ *ᴍᴏᴅᴇ ᴅɪᴜʙᴀʜ*\n\n` +
        `> Mode: *${mode.toUpperCase()}* (${MODES[mode].name})\n` +
        `> Grupo: *${m.chat.split('@')[0]}*\n` +
        (mode === 'store' ? `> Autoorder: *${isAutoorder ? 'ON' : 'OFF'}*` : '') +
        extraInfo +
        `\n\n> Escribe \`${m.prefix}menu\` para ver el menu.`
    )
}

function getGroupMode(chatJid, db) {
    const globalMode = db.setting('botMode') || 'md'
    if (!chatJid?.endsWith('@g.us')) return globalMode
    const groupData = db.getGroup(chatJid) || {}
    return groupData.botMode || globalMode
}

function getModeCategories(mode) {
    const modeConfig = MODES[mode] || MODES.md
    return {
        allowed: modeConfig.allowedCategories,
        excluded: modeConfig.excludeCategories
    }
}

function filterCategoriesByMode(categories, mode) {
    const modeConfig = MODES[mode] || MODES.md

    if (modeConfig.allowedCategories) {
        return categories.filter(cat => modeConfig.allowedCategories.includes(cat.toLowerCase()))
    }

    if (modeConfig.excludeCategories) {
        return categories.filter(cat => !modeConfig.excludeCategories.includes(cat.toLowerCase()))
    }

    return categories
}

export { pluginConfig as config, handler, getGroupMode, getModeCategories, filterCategoriesByMode, MODES }