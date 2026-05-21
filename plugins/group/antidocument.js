import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'antidocument',
    alias: ['antidoc', 'nodocument', 'nodoc'],
    category: 'group',
    description: 'Configura antidocument en el grupo',
    usage: '.antidocument <on/off>',
    example: '.antidocument on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function gpMsg(key, replacements = {}) {
    const defaults = {
        antidocument: '⚠ *AntiDocument* — Documento de @%user% eliminado.',
    }
    let text = config.groupProtection?.[key] || defaults[key] || ''
    for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`%${k}%`, 'g'), v)
    }
    return text
}

async function checkAntidocument(m, sock, db) {
    if (!m.isGroup) return false
    if (m.isAdmin || m.isOwner || m.fromMe) return false

    const groupData = db.getGroup(m.chat) || {}
    if (!groupData.antidocument) return false

    const isDocument = m.isDocument || m.type === 'documentMessage' || m.type === 'documentWithCaptionMessage'
    if (!isDocument) return false

    try {
        await sock.sendMessage(m.chat, { delete: m.key })
    } catch {}

    await sock.sendMessage(m.chat, {
        text: gpMsg('antidocument', { user: m.sender.split('@')[0] }),
        mentions: [m.sender],
    })

    return true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const action = (m.args || [])[0]?.toLowerCase()
    const groupData = db.getGroup(m.chat) || {}

    if (!action) {
        const status = groupData.antidocument ? '✅ ON' : '❌ OFF'
        await m.reply(`📄 *AntiDocument*\n\n> Estado: *${status}*\n\n> \`.antidocument on/off\``)
        return
    }

    if (action === 'on') {
        db.setGroup(m.chat, { antidocument: true })
        m.react('✅')
        await m.reply(`✅ *AntiDocument activado*`)
        return
    }

    if (action === 'off') {
        db.setGroup(m.chat, { antidocument: false })
        m.react('❌')
        await m.reply(`❌ *AntiDocument desactivado*`)
        return
    }

    await m.reply(`❌ Usa \`.antidocument on\` o \`.antidocument off\``)
}

export { pluginConfig as config, handler, checkAntidocument }