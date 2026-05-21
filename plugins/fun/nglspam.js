import { f } from '../../src/lib/ourin-http.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: ['nglspam'],
    alias: ['spamngl'],
    category: 'tools',
    description: 'Genera spam NGL',
    usage: '.nglspam <usuario>|<mensaje>|<cantidad>',
    example: '.nglspam <usuario>|<mensaje>|<cantidad>',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const [username, pesan, jumlah] = m.text.split('|')
    
    if (!text) {
        return m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}spamngl <usuario>|<mensaje>|<cantidad>\`\n\n` +
            `> Ejemplo: \`${m.prefix}spamngl Zann|Holaa|33\``
        )
    }
    
    await m.react('🕕')
    
    try {
        const apiUrl = `https://api.nexray.web.id/tools/spamngl?url=${encodeURIComponent('https://ngl.link/' + username)}&pesan=${encodeURIComponent(pesan)}&jumlah=${encodeURIComponent(jumlah)}`
        const data = await f(apiUrl)
        if(data.status){
            await m.reply('✅ Spam NGL enviado correctamente')
        }else{
            await m.reply('❌ Fallo el spam NGL')
        }
        
        m.react('✅')
        
    } catch (err) {
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
