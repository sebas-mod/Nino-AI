import util from 'util'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'q',
    alias: ['quoted', 'inspect'],
    category: 'tools',
    description: 'Obtener JSON del mensaje respondido',
    usage: '.q (responde a un mensaje)',
    isOwner: true,
    cooldown: 3,
    isEnabled: true
}

async function handler(m) {
    if (!m.quoted) {
        return m.reply('❌ *Responde el mensaje que quieres inspeccionar*')
    }

    try {
        const quoted = m.quoted || {}

        await m.reply(JSON.stringify(quoted, null, 2))
    } catch (err) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }