import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'claninfo',
    alias: ['infoclan', 'myclan', 'guildinfo'],
    category: 'clan',
    description: 'Mira la información del clan',
    usage: '.claninfo [id_clan]',
    example: '.claninfo',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function expBar(exp, nextLevel) {
    const target = nextLevel * 10000
    const progress = Math.min(exp / target, 1)
    const filled = Math.round(progress * 10)
    return '█'.repeat(filled) + '░'.repeat(10 - filled) + ` ${(progress * 100).toFixed(0)}%`
}

function getRankTitle(level) {
    if (level >= 50) return '👑 Legendario'
    if (level >= 30) return '💎 Diamante'
    if (level >= 20) return '🏆 Platino'
    if (level >= 10) return '🥇 Oro'
    if (level >= 5) return '🥈 Plata'
    return '🥉 Bronce'
}

async function handler(m) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    let clanId = m.text?.trim() || user?.clanId

    if (!clanId) {
        return m.reply(
            `❌ No tienes un clan\n\n` +
            `Crear: *.clancreate <nombre>*\n` +
            `Unirse: *.clanjoin <id>*`
        )
    }

    if (!db.db.data.clans) db.db.data.clans = {}

    const clan = db.db.data.clans[clanId]
        || Object.values(db.db.data.clans).find(c => c.name.toLowerCase() === clanId.toLowerCase())
        || Object.values(db.db.data.clans).find(c => c.id.toLowerCase() === clanId.toLowerCase())
    if (!clan) return m.reply(`❌ Clan no encontrado`)

    const totalGames = (clan.wins || 0) + (clan.losses || 0)
    const winRate = totalGames > 0
        ? ((clan.wins / totalGames) * 100).toFixed(1)
        : '—'

    const rank = getRankTitle(clan.level || 1)
    const emblem = clan.emblem || '🏰'
    const bar = expBar(clan.exp || 0, clan.level || 1)

    await m.reply(
        `${emblem} *${clan.name}*\n` +
        `${rank} · Nivel ${clan.level || 1}\n\n` +
        `EXP  ${bar}\n\n` +
        `┌ 👑 Líder · @${clan.leader.split('@')[0]}\n` +
        `├ 👥 Miembros · ${clan.members.length}/50\n` +
        `├ 🔓 Estado · ${clan.isOpen ? 'Abierto' : 'Cerrado'}\n` +
        `└ 📅 Creado · ${new Date(clan.createdAt).toLocaleDateString('id-ID')}\n\n` +
        `⚔️ *Estadísticas de guerra*\n` +
        `${clan.wins || 0}V · ${clan.losses || 0}D · ${winRate}% victorias\n\n` +
        `_${clan.description || 'Sin descripción'}_\n\n` +
        `ID: \`${clan.id}\``,
        { mentions: [clan.leader] }
    )
}

export { pluginConfig as config, handler }
