import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'buyfitur',
    alias: ['belifitur', 'purchasefeature', 'buyfeature'],
    category: 'user',
    description: 'Compra funciones premium (1 función = 3000 koin)',
    usage: '.buyfitur [nama_fitur]',
    example: '.buyfitur',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const PRICE_PER_FEATURE = 3000

const PREMIUM_FEATURES = [
    { id: 'sticker', name: 'Stickers ilimitados', desc: 'Comandos de stickers ilimitados' },
    { id: 'downloader', name: 'Descargador Pro', desc: 'Descargas sin límite' },
    { id: 'ai', name: 'Acceso IA', desc: 'Acceso a funciones IA premium' },
    { id: 'tools', name: 'Herramientas avanzadas', desc: 'Herramientas exclusivas' },
    { id: 'game', name: 'Bonus de juego', desc: '2x recompensas de juegos' }
]

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender) || db.setUser(m.sender)
    const featureName = m.args[0]?.toLowerCase()
    
    if (user.isPremium || config.isPremium(m.sender)) {
        return m.reply(
            `✨ *ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀ*\n\n` +
            `> Ya eres premium!\n` +
            `> Todas las funciones ya están desbloqueadas!`
        )
    }
    
    if (!featureName) {
        const unlockedFeatures = user.unlockedFeatures || []
        
        let text = `╭━━━━━━━━━━━━━━━━━╮\n`
        text += `┃  🛒 *ʙᴜʏ ꜰɪᴛᴜʀ*\n`
        text += `╰━━━━━━━━━━━━━━━━━╯\n\n`
        
        text += `> Precio: *${formatNumber(PRICE_PER_FEATURE)}* bal/función\n`
        text += `> Koin: *${formatNumber(user.koin || 0)}*\n\n`
        
        text += `╭┈┈⬡「 📋 *ꜰɪᴛᴜʀ* 」\n`
        
        for (const feature of PREMIUM_FEATURES) {
            const isUnlocked = unlockedFeatures.includes(feature.id)
            const status = isUnlocked ? '✅' : '🔒'
            text += `┃ ${status} *${feature.name}*\n`
            text += `┃    _${feature.desc}_\n`
            text += `┃    ID: \`${feature.id}\`\n`
            text += `┃\n`
        }
        
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        text += `> Usa: \`.buyfitur <id>\`\n`
        text += `> O hazte *Premium* y desbloquea todo!`
        
        await m.reply(text)
        return
    }
    
    const feature = PREMIUM_FEATURES.find(f => f.id === featureName)
    
    if (!feature) {
        return m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `> La función \`${featureName}\` no fue encontrada\n` +
            `> Escribe \`.buyfitur\` para ver la lista`
        )
    }
    
    const unlockedFeatures = user.unlockedFeatures || []
    
    if (unlockedFeatures.includes(feature.id)) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> La función \`${feature.name}\` ya está desbloqueada!`)
    }
    
    if ((user.koin || 0) < PRICE_PER_FEATURE) {
        return m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `> No tienes koin suficientes!\n` +
            `> Necesitas: *${formatNumber(PRICE_PER_FEATURE)}*\n` +
            `> Tienes: *${formatNumber(user.koin || 0)}*`
        )
    }
    
    db.updateKoin(m.sender, -PRICE_PER_FEATURE)
    unlockedFeatures.push(feature.id)
    db.setUser(m.sender, { unlockedFeatures })
    
    const newKoin = db.getUser(m.sender).koin
    
    m.react('✅')
    
    await m.reply(
        `✅ *ꜰɪᴛᴜʀ ᴅɪ-ᴜɴʟᴏᴄᴋ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 🎁 ꜰɪᴛᴜʀ: *${feature.name}*\n` +
        `┃ 💵 Precio: *-${formatNumber(PRICE_PER_FEATURE)}* bal\n` +
        `┃ 💰 sɪsᴀ: *${formatNumber(newKoin)}*\n` +
        `╰┈┈⬡\n\n` +
        `> _${feature.desc}_\n\n` +
        `> 💡 Tip: Hazte *Premium* para desbloquear TODO!`
    )
}

export { pluginConfig as config, handler, PREMIUM_FEATURES }
