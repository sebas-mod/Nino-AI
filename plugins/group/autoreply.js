import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
import fs from 'fs'
import path from 'path'
const pluginConfig = {
    name: 'autoreply',
    alias: ['smarttrigger', 'smarttriggers', 'ar'],
    category: 'group',
    description: 'Configura autoreply/disparadores inteligentes por grupo',
    usage: '.autoreply on/off/add/del/list/private',
    example: '.autoreply on',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: false,
    isBotAdmin: false
}

const AUTOREPLY_MEDIA_DIR = path.join(process.cwd(), 'database', 'autoreply_media')

if (!fs.existsSync(AUTOREPLY_MEDIA_DIR)) {
    fs.mkdirSync(AUTOREPLY_MEDIA_DIR, { recursive: true })
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    
    const privateAutoreply = db.setting('autoreplyPrivate') ?? false
    
    if (action === 'private') {
        if (!m.isOwner) {
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Solo el owner puede configurar autoreply private!`)
        }
        
        const subAction = args[1]?.toLowerCase()
        
        if (subAction === 'on') {
            db.setting('autoreplyPrivate', true)
            m.react('✅')
            return m.reply(`✅ *ᴀᴜᴛᴏʀᴇᴘʟʏ ᴘʀɪᴠᴀᴛᴇ ᴅɪᴀᴋᴛɪꜰᴋᴀɴ*\n\n> El bot respondera automaticamente en chats privados`)
        }
        
        if (subAction === 'off') {
            db.setting('autoreplyPrivate', false)
            m.react('❌')
            return m.reply(`❌ *ᴀᴜᴛᴏʀᴇᴘʟʏ ᴘʀɪᴠᴀᴛᴇ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ*\n\n> El bot no respondera automaticamente en chats privados`)
        }
        
        const currentStatus = db.setting('autoreplyPrivate') ?? false
        return m.reply(
            `📱 *AUTOREPLY PRIVATE*\n\n` +
            `Estado: *${currentStatus ? '✅ AKTIF' : '❌ NONAKTIF'}*\n\n` +
            `*PERINTAH TERSEDIA:*\n` +
            `• *${m.prefix}autoreply private on* — Activar private\n` +
            `• *${m.prefix}autoreply private off* — Desactivar private`
        )
    }
    
    if (action === 'global') {
        if (!m.isOwner) {
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Solo el owner puede configurar global autoreply!`)
        }
        
        const subAction = args[1]?.toLowerCase()
        const globalCustomReplies = db.setting('globalCustomReplies') || []
        
        if (subAction === 'add') {
            const fullBody = m.body || ''
            const pipeIdx = fullBody.indexOf('|')
            if (pipeIdx === -1) {
                return m.reply(
                    `❌ *ꜰᴏʀᴍᴀᴛ sᴀʟᴀʜ*\n\n` +
                    `> Usa format: \`trigger|reply\`\n\n` +
                    `> Ejemplo:\n` +
                    `> \`${m.prefix}autoreply global add halo|Hai {name}!\``
                )
            }
            
            const triggerStart = fullBody.toLowerCase().indexOf('global add ') + 'global add '.length
            const triggerEnd = pipeIdx
            const trigger = fullBody.substring(triggerStart, triggerEnd).trim()
            const reply = fullBody.substring(pipeIdx + 1)
            
            if (!trigger.trim() || !reply) {
                return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> El trigger y la respuesta no pueden estar vacios!`)
            }
            
            const existingIndex = globalCustomReplies.findIndex(r => r.trigger.toLowerCase() === trigger.trim().toLowerCase())
            if (existingIndex !== -1) {
                globalCustomReplies[existingIndex].reply = reply
            } else {
                globalCustomReplies.push({ trigger: trigger.trim().toLowerCase(), reply: reply })
            }
            
            db.setting('globalCustomReplies', globalCustomReplies)
            await db.save()
            
            m.react('✅')
            return m.reply(
                `✅ *GLOBAL AUTOREPLY AGREGADO*\n\n` +
                `• Trigger: *${trigger.trim()}*\n` +
                `• Total: *${globalCustomReplies.length}* replies\n\n` +
                `_Activo en todos los grupos y chats privados_`
            )
        }
        
        if (subAction === 'del' || subAction === 'rm') {
            const trigger = args.slice(2).join(' ').toLowerCase().trim()
            if (!trigger) {
                return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Ingresa trigger yang mau eliminado!`)
            }
            
            const index = globalCustomReplies.findIndex(r => r.trigger === trigger)
            if (index === -1) {
                return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Trigger \`${trigger}\` no se encontro!`)
            }
            
            globalCustomReplies.splice(index, 1)
            db.setting('globalCustomReplies', globalCustomReplies)
            await db.save()
            
            m.react('🗑️')
            return m.reply(`🗑️ *GLOBAL AUTOREPLY ELIMINADO*\n\nTrigger *${trigger}* se elimino correctamente!`)
        }
        
        if (subAction === 'list' || !subAction) {
            if (globalCustomReplies.length === 0) {
                return m.reply(
                    `📋 *GLOBAL AUTOREPLY*\n\n` +
                    `Estado: *❌ NO HAY DATOS*\n\n` +
                    `*PERINTAH TERSEDIA:*\n` +
                    `• *${m.prefix}autoreply global add <trigger>|<reply>*`
                )
            }
            
            let text = `📋 *GLOBAL AUTOREPLY*\n\n`
            text += `Total: *${globalCustomReplies.length}* replies\n`
            text += `Aplica en: *Todos los grupos y chats privados*\n\n`
            text += `*LISTA DE TRIGGERS:*\n`
            globalCustomReplies.forEach((r, i) => {
                const hasImage = r.image ? '🖼️' : ''
                text += `${i + 1}. *${r.trigger}* ${hasImage}\n   ↳ ${r.reply.substring(0, 30)}${r.reply.length > 30 ? '...' : ''}\n\n`
            })
            return m.reply(text.trim())
        }
        
        return m.reply(
            `📱 *ɢʟᴏʙᴀʟ ᴀᴜᴛᴏʀᴇᴘʟʏ*\n\n` +
            `> \`${m.prefix}autoreply global add trigger|reply\`\n` +
            `> \`${m.prefix}autoreply global del trigger\`\n` +
            `> \`${m.prefix}autoreply global list\``
        )
    }
    
    if (!m.isGroup) {
        return m.reply(
            `📱 *SISTEM AUTOREPLY*\n\n` +
            `Autoreply Private: *${privateAutoreply ? '✅ AKTIF' : '❌ NONAKTIF'}*\n\n` +
            `*PERINTAH TERSEDIA:*\n` +
            `• *${m.prefix}autoreply private on/off* — Toggle private\n` +
            `• *${m.prefix}autoreply global add/del/list* — Global triggers\n\n` +
            `_Nota: Para configurar autoreply del grupo, usa este comando dentro del grupo._`
        )
    }
    
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Solo admins pueden configurar autoreply en el grupo!`)
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const globalSmartTriggers = db.setting('smartTriggers') ?? config.features?.smartTriggers ?? false
    
    if (!action || action === 'status') {
        const groupStatus = groupData.autoreply
        const effectiveStatus = groupStatus ?? globalSmartTriggers
        const customReplies = groupData.customReplies || []
        
        let text = `🤖 *SISTEMA AUTOREPLY DEL GRUPO*\n\n`
        text += `Status Global: *${globalSmartTriggers ? '✅ AKTIF' : '❌ NONAKTIF'}*\n`
        text += `Estado de este grupo: *${groupStatus === undefined ? 'DEFAULT' : (groupStatus ? '✅ AKTIF' : '❌ NONAKTIF')}*\n`
        text += `Status Private: *${privateAutoreply ? '✅ AKTIF' : '❌ NONAKTIF'}*\n`
        text += `Efectivo en el grupo: *${effectiveStatus ? '✅ AKTIF' : '❌ NONAKTIF'}*\n`
        text += `Total Custom Reply (Grupo): *${customReplies.length}*\n\n`
        text += `*GESTION DEL GRUPO:*\n`
        text += `• *${m.prefix}autoreply on* — Activar en este grupo\n`
        text += `• *${m.prefix}autoreply off* — Desactivar en este grupo\n`
        text += `• *${m.prefix}autoreply add <trigger>|<reply>* — Agregar respuesta personalizada\n`
        text += `• *${m.prefix}autoreply del <trigger>* — Eliminar respuesta personalizada\n`
        text += `• *${m.prefix}autoreply list* — Ver todos los triggers de este grupo\n`
        text += `• *${m.prefix}autoreply reset* — Eliminar TODOS los personalizados de este grupo\n\n`
        
        if (m.isOwner) {
            text += `*MANAJEMEN GLOBAL (OWNER):*\n`
            text += `• *${m.prefix}autoreply global add <trigger>|<reply>*\n`
            text += `• *${m.prefix}autoreply global del <trigger>*\n`
            text += `• *${m.prefix}autoreply global list* — Triggers activos aplicables\n`
            text += `• *${m.prefix}autoreply private on/off* — Toggle bot reply di DM\n\n`
        }
        
        text += `*COMO AGREGAR IMAGENES:*\n`
        text += `1. Kirim imagen beserta caption: *${m.prefix}autoreply add trigger|reply*\n`
        text += `2. Atau reply imagen con: *${m.prefix}autoreply add trigger|reply*\n\n`
        text += `*PUEDES USAR PLACEHOLDERS:*\n`
        text += `{name} • {tag} • {sender} • {botname} • {time} • {date}`
        
        return m.reply(text)
    }
    
    if (action === 'on') {
        db.setGroup(m.chat, { ...groupData, autoreply: true })
        m.react('✅')
        return m.reply(`✅ *ᴀᴜᴛᴏʀᴇᴘʟʏ ᴅɪᴀᴋᴛɪꜰᴋᴀɴ*\n\n> El bot respondera automaticamente en este grupo`)
    }
    
    if (action === 'off') {
        db.setGroup(m.chat, { ...groupData, autoreply: false })
        m.react('❌')
        return m.reply(`❌ *ᴀᴜᴛᴏʀᴇᴘʟʏ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ*\n\n> El bot no respondera automaticamente en este grupo`)
    }
    
    if (action === 'add') {
        const fullBody = m.body || ''
        const pipeIdx = fullBody.indexOf('|')
        
        if (pipeIdx === -1) {
            return m.reply(
                `❌ *FORMAT SALAH*\n\n` +
                `Usa format: *trigger|reply*\n\n` +
                `*Text Only:*\n` +
                `• ${m.prefix}ar add halo|Hai {name}! 👋\n\n` +
                `*Con imagen:*\n` +
                `1. Reply imagen + ${m.prefix}ar add trigger|caption\n` +
                `2. Kirim imagen + caption ${m.prefix}ar add trigger|caption\n\n` +
                `*Placeholder:*\n` +
                `• {name} - Nombre user\n` +
                `• {tag} - Tag @user\n` +
                `• {sender} - Numero de usuario\n` +
                `• {botname} - Nombre bot\n` +
                `• {time} - Hora actual\n` +
                `• {date} - Tanggal sekarang`
            )
        }
        
        const addIdx = fullBody.toLowerCase().indexOf('add ')
        const triggerStart = addIdx + 'add '.length
        const trigger = fullBody.substring(triggerStart, pipeIdx).trim()
        const reply = fullBody.substring(pipeIdx + 1)
        
        if (!trigger) {
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> El trigger no puede estar vacio!`)
        }
        
        let imageBuffer = null
        let imagePath = null
        
        const hasQuotedImage = m.quoted && (m.quoted.mtype === 'imageMessage' || m.quoted.type === 'image')
        const hasDirectImage = m.mtype === 'imageMessage' || m.type === 'image'
        
        if (hasQuotedImage) {
            try {
                imageBuffer = await m.quoted.download()
            } catch (e) {
                console.error('[Autoreply] Failed to download quoted image:', e.message)
            }
        } else if (hasDirectImage) {
            try {
                imageBuffer = await m.download()
            } catch (e) {
                console.error('[Autoreply] Failed to download direct image:', e.message)
            }
        }
        
        if (imageBuffer) {
            const filename = `${m.chat.replace('@g.us', '')}_${trigger.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`
            imagePath = path.join(AUTOREPLY_MEDIA_DIR, filename)
            fs.writeFileSync(imagePath, imageBuffer)
        }
        
        const customReplies = groupData.customReplies || []
        const existingIndex = customReplies.findIndex(r => r.trigger.toLowerCase() === trigger.toLowerCase())
        
        const replyData = {
            trigger: trigger.toLowerCase(),
            reply: reply || '',
            image: imagePath || null,
            createdAt: Date.now()
        }
        
        if (existingIndex !== -1) {
            if (customReplies[existingIndex].image && customReplies[existingIndex].image !== imagePath) {
                try {
                    if (fs.existsSync(customReplies[existingIndex].image)) {
                        fs.unlinkSync(customReplies[existingIndex].image)
                    }
                } catch {}
            }
            customReplies[existingIndex] = replyData
        } else {
            customReplies.push(replyData)
        }
        
        db.setGroup(m.chat, { ...groupData, customReplies })
        
        m.react('✅')
        
        let successMsg = `✅ *AUTOREPLY AGREGADO*\n\n`
        successMsg += `*DETAIL:*\n`
        successMsg += `• Trigger: *${trigger.trim()}*\n`
        if (reply) {
            successMsg += `• Reply: ${reply.substring(0, 50)}${reply.length > 50 ? '...' : ''}\n`
        }
        if (imagePath) {
            successMsg += `• Image: ✅ Tersimpan\n`
        }
        successMsg += `\nTotal: *${customReplies.length}* respuestas en este grupo`
        
        return m.reply(successMsg)
    }
    
    if (action === 'del' || action === 'rm' || action === 'remove') {
        const trigger = args.slice(1).join(' ').toLowerCase().trim()
        
        if (!trigger) {
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Ingresa trigger yang mau eliminado!\n\n\`${m.prefix}autoreply del halo\``)
        }
        
        const customReplies = groupData.customReplies || []
        const index = customReplies.findIndex(r => r.trigger === trigger)
        
        if (index === -1) {
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Trigger \`${trigger}\` no se encontro!`)
        }
        
        if (customReplies[index].image) {
            try {
                if (fs.existsSync(customReplies[index].image)) {
                    fs.unlinkSync(customReplies[index].image)
                }
            } catch {}
        }
        
        customReplies.splice(index, 1)
        db.setGroup(m.chat, { ...groupData, customReplies })
        
        m.react('🗑️')
        return m.reply(
            `🗑️ *AUTOREPLY ELIMINADO*\n\n` +
            `Trigger *${trigger}* se elimino correctamente!\n` +
            `Quedan: *${customReplies.length}* replies`
        )
    }
    
    if (action === 'list') {
        const customReplies = groupData.customReplies || []
        
        const defaultTriggers = [
            { trigger: '@mention', reply: '👋 Hai! Alguien llamo al bot?' },
            { trigger: 'p', reply: '💬 Saluda antes de conversar!' },
            { trigger: 'bot / ourin', reply: '🤖 Bot activo dan siap!' },
            { trigger: 'assalamualaikum', reply: 'Waalaikumsalam saudaraku' }
        ]
        
        let text = `📋 *LISTA DE AUTOREPLY DEL GRUPO*\n\n`
        
        text += `*DEFAULT TRIGGERS:*\n`
        defaultTriggers.forEach((r, i) => {
            text += `• *${r.trigger}*\n`
            text += `  ↳ ${r.reply}\n`
        })
        text += `\n`
        
        if (customReplies.length > 0) {
            text += `*CUSTOM TRIGGERS:*\n`
            customReplies.forEach((r, i) => {
                const hasImage = r.image ? '🖼️' : ''
                text += `• *${r.trigger}* ${hasImage}\n`
                if (r.reply) {
                    text += `  ↳ ${r.reply.substring(0, 35)}${r.reply.length > 35 ? '...' : ''}\n`
                }
            })
            text += `\n`
        } else {
            text += `*CUSTOM TRIGGERS:*\n`
            text += `_Aun no hay triggers personalizados en este grupo_\n\n`
        }
        
        text += `_Nota: Los triggers predeterminados del bot no se pueden editar._`
        
        return m.reply(text)
    }
    
    if (action === 'reset' || action === 'clear') {
        const customReplies = groupData.customReplies || []
        for (const r of customReplies) {
            if (r.image) {
                try {
                    if (fs.existsSync(r.image)) fs.unlinkSync(r.image)
                } catch {}
            }
        }
        
        db.setGroup(m.chat, { ...groupData, customReplies: [] })
        m.react('🗑️')
        return m.reply(`🗑️ *ᴀᴜᴛᴏʀᴇᴘʟʏ ᴅɪʀᴇsᴇᴛ*\n\n> Todos los autoreply personalizados fueron eliminados!`)
    }
    
    return m.reply(`❌ *ᴀᴄᴛɪᴏɴ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n> Usa: \`on\`, \`off\`, \`private on/off\`, \`add\`, \`del\`, \`list\`, \`reset\``)
}

export { pluginConfig as config, handler }