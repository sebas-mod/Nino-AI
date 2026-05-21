import moment from 'moment-timezone'
import config from '../../config.js'
const pluginConfig = {
    name: 'absen',
    alias: ['hadir', 'present'],
    category: 'group',
    description: 'Marca asistencia en la sesion',
    usage: '.absen',
    example: '.absen',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}
if (!global.absensi) global.absensi = {}
async function handler(m, { sock }) {
    const chatId = m.chat
    if (!global.absensi[chatId]) {
        return m.reply(
            `❌ *ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴀʙsᴇɴ*\n\n` +
            `> No hay una sesion de asistencia en este grupo!\n\n` +
            `> Admin dapat memulai con\n` +
            `> *.mulaiabsen [keterangan]*`
        )
    }
    const absen = global.absensi[chatId]
    if (absen.peserta.includes(m.sender)) {
        return m.reply(`❌ Ya marcaste asistencia!`)
    }
    absen.peserta.push(m.sender)
    const now = moment().tz('Asia/Jakarta')
    const dateStr = now.format('D MMMM YYYY')
    const list = absen.peserta
        .map((jid, i) => `┃ ${i + 1}. @${jid.split('@')[0]}`)
        .join('\n')
    await m.reply(`✅ *MANTAP, @${m.sender.split('@')[0]} HADIRR*\n` +
            `TUJUAN ABSEN: ${absen.keterangan}\n` +
            `╭┈┈⬡「 📋 INFO LAIN 」\n` +
            `┃ 📅 ${dateStr}\n` +
            `┃ 👥 Total: ${absen.peserta.length}\n` +
            `├┈┈⬡「 📝 *ᴅᴀғᴛᴀʀ ʜᴀᴅɪʀ* 」\n` +
            `${list}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> _Escribe *${m.prefix}absen* para hadir_\n` +
            `> _Escribe *${m.prefix}cekabsen* para ver la lista_`,
            { mentions: absen.peserta })
}
export { pluginConfig as config, handler }