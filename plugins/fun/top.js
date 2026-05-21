import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'top',
    alias: ['top5', 'toplist'],
    category: 'fun',
    description: 'Top 5 aleatorio de miembros para una categoria',
    usage: '.top <categoria>',
    example: '.top personas inteligentes',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const kategori = m.args.join(' ')?.trim()
    
    if (!kategori) {
        return m.reply(
            `\`Ejemplo: ${m.prefix}top personas inteligentes\``
        )
    }
    
    m.react('🕕')
    
    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        
        const members = participants
            .map(p => p.jid)
            .filter(id => id && id !== sock.user?.id?.split(':')[0] + '@s.whatsapp.net')
        
        if (members.length < 2) {
            return m.reply(`❌ Hay menos de 5 miembros en el grupo!`)
        }
        
        const shuffled = members.sort(() => Math.random() - 0.5)
        const top5 = shuffled.slice(0, 5)
        
        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
        let list = ''
        
        top5.forEach((jid, index) => {
            list += `*${index + 1}* ${medals[index]} @${jid.split('@')[0]}\n`
        })
        
        await m.reply(`🏆 *ᴛᴏᴘ 5 ${kategori.toUpperCase()}*\n${list}`, { mentions: top5 })
        m.react('✅')
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
