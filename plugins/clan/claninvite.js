import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'claninvite',
    alias: ['inviteclan'],
    category: 'clan',
    description: 'Invita y agrega directamente un usuario al clan',
    usage: '.claninvite @user',
    example: '.claninvite @user',
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
    if (!clan) return m.reply(`❌ Clan no encontrado`)

    const target = m.mentionedJid?.[0] || m.quoted?.sender
    if (!target) {
        return m.reply(
            `📨 *INVITAR AL CLAN*\n\n` +
            `Etiqueta o responde al usuario que quieres invitar\n\n` +
            `Ejemplo: *.claninvite @user*`
        )
    }

    if (target === m.sender) return m.reply(`❌ No puedes invitarte a ti mismo`)

    const targetUser = db.getUser(target)
    if (targetUser?.clanId) return m.reply(`❌ Ese usuario ya tiene un clan`)
    if (clan.members.length >= 50) return m.reply(`❌ El clan está lleno (50/50)`)

    clan.members.push(target)
    db.setUser(target, { clanId: user.clanId })
    db.save()

    const emblem = clan.emblem || '🏰'

    await m.reply(
        `${emblem} *INVITADO!*\n\n` +
        `@${target.split('@')[0]} se unió a *${clan.name}*\n` +
        `Miembros: ${clan.members.length}/50`,
        { mentions: [m.sender, target] }
    )
}

export { pluginConfig as config, handler }
