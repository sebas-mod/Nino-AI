import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'clanjoin',
    alias: ['joinclan', 'guildjoin'],
    category: 'clan',
    description: 'Únete a un clan',
    usage: '.clanjoin <id_clan>',
    example: '.clanjoin clan_123456',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const MAX_MEMBERS = 50

async function handler(m) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    const clanId = m.text?.trim()

    if (!clanId) {
        return m.reply(
            `🏰 *UNIRSE AL CLAN*\n\n` +
            `Ingresa el ID del clan!\n\n` +
            `Ejemplo: *.clanjoin clan_123456*\n` +
            `Ver ID: *.clanleaderboard*`
        )
    }

    if (user.clanId) {
        return m.reply(`❌ Ya tienes un clan\nSal primero: *.clanleave*`)
    }

    if (!db.db.data.clans) db.db.data.clans = {}

    const clan = db.db.data.clans[clanId]
        || Object.values(db.db.data.clans).find(c => c.name.toLowerCase() === clanId.toLowerCase())
        || Object.values(db.db.data.clans).find(c => c.id.toLowerCase() === clanId.toLowerCase())
    if (!clan) return m.reply(`❌ Clan no encontrado`)
    if (!clan.isOpen) return m.reply(`❌ *${clan.name}* está cerrado`)
    if (clan.members.length >= MAX_MEMBERS) return m.reply(`❌ *${clan.name}* está lleno (${MAX_MEMBERS}/${MAX_MEMBERS})`)

    clan.members.push(m.sender)
    db.setUser(m.sender, { clanId })
    db.save()

    const emblem = clan.emblem || '🏰'

    await m.reply(
        `${emblem} *BIENVENIDO!*\n\n` +
        `@${m.sender.split('@')[0]} se unió a *${clan.name}*\n\n` +
        `Líder: @${clan.leader.split('@')[0]}\n` +
        `Miembros: ${clan.members.length}/${MAX_MEMBERS}\n\n` +
        `Ver info: *.claninfo*`,
        { mentions: [m.sender, clan.leader] }
    )
}

export { pluginConfig as config, handler }
