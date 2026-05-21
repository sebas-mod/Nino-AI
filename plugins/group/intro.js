import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
import moment from 'moment-timezone'
const pluginConfig = {
    name: 'intro',
    alias: ['perkenalan', 'selamatdatang'],
    category: 'group',
    description: 'Muestra el mensaje de introduccion del grupo',
    usage: '.intro',
    example: '.intro',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const DEFAULT_INTRO = `halo kak @user 🖐

Kenalan dulu yukk
- Nombre : 
- Umur : 
- Asal : 
- Hobi : 
- Status : 

Semoga betah yahh, di grupo @group

> Untuk Owner:
ganti intro bawaan con .setintro <text>`
 function parsePlaceholders(text, m, groupMeta) {
    const now = moment().tz('Asia/Jakarta')
    const dateStr = now.format('D MMMM YYYY')
    const timeStr = now.format('HH:mm')
    
    return text
        .replace(/@user/gi, `@${m.sender.split('@')[0]}`)
        .replace(/@group/gi, groupMeta?.subject || 'Grupo')
        .replace(/@count/gi, groupMeta?.participants?.length || '0')
        .replace(/@date/gi, dateStr)
        .replace(/@time/gi, timeStr)
        .replace(/@desc/gi, groupMeta?.desc || 'No hay deskripsi')
        .replace(/@botname/gi, config.bot?.name || 'Nino AI')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || db.setGroup(m.chat)
    const groupMeta = m.groupMetadata
    
    const introText = groupData.intro || DEFAULT_INTRO
    const parsed = parsePlaceholders(introText, m, groupMeta)
    
    await m.reply(parsed, { mentions: [m.sender] })
}

export { pluginConfig as config, handler, parsePlaceholders, DEFAULT_INTRO }