import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'onlyadmin',
    alias: ['selfadmin', 'publicadmin', 'adminonly'],
    category: 'owner',
    description: 'Solo admins del grupo pueden acceder a comandos del bot',
    usage: '.onlyadmin on/off',
    example: '.onlyadmin on',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const args = m.args[0]?.toLowerCase()
    const cmd = m.command.toLowerCase()
    const current = db.setting('onlyAdmin') || false

    if (cmd === 'selfadmin') {
        if (current) {
            db.setting('onlyAdmin', false)
            await m.react('❌')
            return m.reply('❌ *ᴏɴʟʏᴀᴅᴍɪɴ ɴᴏɴᴀᴋᴛɪꜰ*\n\n> Todos pueden acceder al bot')
        }
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *ᴏɴʟʏᴀᴅᴍɪɴ ᴀᴋᴛɪꜰ*\n\n' +
            '╭┈┈⬡「 🔒 *ᴀᴋsᴇs* 」\n' +
            '┃ ✅ Admin grupos\n' +
            '┃ ✅ Owner bot\n' +
            '┃ ❌ Miembro normal\n' +
            '╰┈┈⬡\n\n' +
            '> Usa `.onlyadmin off` para desactivar'
        )
    }

    if (cmd === 'publicadmin') {
        if (current) {
            db.setting('onlyAdmin', false)
            await m.react('❌')
            return m.reply('❌ *ᴏɴʟʏᴀᴅᴍɪɴ ɴᴏɴᴀᴋᴛɪꜰ*\n\n> Todos pueden acceder al bot')
        }
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *ᴏɴʟʏᴀᴅᴍɪɴ ᴀᴋᴛɪꜰ*\n\n' +
            '╭┈┈⬡「 🔒 *ᴀᴋsᴇs* 」\n' +
            '┃ ✅ Admin grupos\n' +
            '┃ ✅ Owner bot\n' +
            '┃ ✅ Chat privado (todos)\n' +
            '┃ ❌ Miembro normal en el grupo\n' +
            '╰┈┈⬡\n\n' +
            '> Usa `.onlyadmin off` para desactivar'
        )
    }

    if (!args || args === 'status') {
        return m.reply(
            `🔒 *ᴏɴʟʏᴀᴅᴍɪɴ*\n\n` +
            `> Status: ${current ? '✅ Activo' : '❌ Inactivo'}\n\n` +
            `*Penggunaan:*\n` +
            `> \`.onlyadmin on\` — Activar\n` +
            `> \`.onlyadmin off\` — Inactivokan\n\n` +
            `_Solo admins del grupo, owner y chats privados pueden acceder al bot_`
        )
    }

    if (args === 'on') {
        if (current) return m.reply('⚠️ OnlyAdmin ya esta activo.')
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *ᴏɴʟʏᴀᴅᴍɪɴ ᴀᴋᴛɪꜰ*\n\n' +
            '╭┈┈⬡「 🔒 *ᴀᴋsᴇs* 」\n' +
            '┃ ✅ Admin grupos\n' +
            '┃ ✅ Owner bot\n' +
            '┃ ✅ Chat privado (todos)\n' +
            '┃ ❌ Miembro normal en el grupo\n' +
            '╰┈┈⬡'
        )
    }

    if (args === 'off') {
        if (!current) return m.reply('⚠️ OnlyAdmin ya esta inactivo.')
        db.setting('onlyAdmin', false)
        await m.react('❌')
        return m.reply('❌ *ᴏɴʟʏᴀᴅᴍɪɴ ɴᴏɴᴀᴋᴛɪꜰ*\n\n> Todos pueden acceder al bot')
    }

    return m.reply('❌ Argumento no valido. Usa: `on` o `off`')
}

export { pluginConfig as config, handler }