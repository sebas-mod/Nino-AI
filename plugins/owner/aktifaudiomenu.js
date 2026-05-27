import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'activoaudiomenu',
    alias: ['audiomenu', 'setaudiomenu', 'toggleaudiomenu'],
    category: 'owner',
    description: 'Alternar audio al mostrar el menu',
    usage: '.activoaudiomenu ya/gak',
    example: '.activoaudiomenu ya',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const option = args[0]?.toLowerCase()

    const current = db.setting('audioMenu') !== false

    if (!option) {
        return m.reply(
            `🔊 *ᴀᴜᴅɪᴏ ᴍᴇɴᴜ sᴇᴛᴛɪɴɢ*\n\n` +
            `> Estado: *${current ? '✅ Activo' : '❌ Inactivo'}*\n\n` +
            `*Modo de uso:*\n` +
            `> \`${m.prefix}activoaudiomenu ya\` - Activar audio\n` +
            `> \`${m.prefix}activoaudiomenu gak\` - Desactivar audio`
        )
    }

    if (option === 'ya' || option === 'on' || option === '1' || option === 'activo') {
        if (current) {
            return m.reply(`⚠️ El audio del menu ya esta activo!`)
        }
        db.setting('audioMenu', true)
        await db.save()
        await m.react('✅')
        return m.reply(`✅ Audio del menu *activado*!\n\n> Ahora cuando alguien escriba \`.menu\`, aparecera el audio.`)
    }

    if (option === 'gak' || option === 'off' || option === '0' || option === 'nonactivo') {
        if (!current) {
            return m.reply(`⚠️ El audio del menu ya esta inactivo!`)
        }
        db.setting('audioMenu', false)
        await db.save()
        await m.react('✅')
        return m.reply(`❌ Audio del menu *desactivado*!\n\n> Sekarang \`.menu\` tidak akan ada audio.`)
    }

    return m.reply(`❌ Opcion no valida!\n\nUsa: \`ya\` o \`gak\``)
}

export { pluginConfig as config, handler }