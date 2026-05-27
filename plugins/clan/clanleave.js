import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'clanleave',
    alias: ['leaveclan', 'guildleave'],
    category: 'clan',
    description: 'Salir del clan',
    usage: '.clanleave',
    example: '.clanleave',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const user = db.getUser(m.sender)

    if (!user?.clanId) return m.reply(`❌ No tienes un clan`)
    if (!db.db.data.clans) db.db.data.clans = {}

    const clan = db.db.data.clans[user.clanId]
    if (!clan) {
        db.setUser(m.sender, { clanId: null })
        db.save()
        return m.reply(`❌ Clan no encontrado, datos limpiados`)
    }

    if (clan.leader === m.sender) {
        if (clan.members.length > 1) {
            return m.reply(
                `❌ Eres el líder!\n\n` +
                `Transfiere primero: *.clantransfer @user*\n` +
                `O expulsa primero a todos los miembros`
            )
        }
        delete db.db.data.clans[user.clanId]
        db.setUser(m.sender, { clanId: null })
        db.save()

        const emblem = clan.emblem || '🏰'
        return m.reply(`${emblem} El clan *${clan.name}* fue disuelto`)
    }

    clan.members = clan.members.filter(jid => jid !== m.sender)
    db.setUser(m.sender, { clanId: null })
    db.save()

    await m.reply(`👋 Saliste de *${clan.name}*`)
}

export { pluginConfig as config, handler }
