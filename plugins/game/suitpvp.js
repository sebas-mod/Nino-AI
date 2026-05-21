import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'suitpvp',
    alias: ['suit', 'rps', 'janken'],
    category: 'game',
    description: 'Juega piedra, papel o tijera con otro jugador',
    usage: '.suit @tag',
    example: '.suit @628xxx',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

if (!global.suitGames) global.suitGames = {}

const TIMEOUT = 90000
const WIN_REWARD = 1000

const EMOJI = {
    batu: '✊',
    gunting: '✌️',
    kertas: '✋'
}

async function handler(m, { sock }) {
    const db = getDatabase()
    
    const existingSala = Object.values(global.suitGames).find(
        sala => [sala.p, sala.p2].includes(m.sender)
    )
    
    if (existingSala) {
        return m.reply(
            `❌ Todavia estas en una partida de piedra, papel o tijera!\n\n` +
            `> Termina tu partida primero.`
        )
    }
    
    let target = null
    if (m.quoted) {
        target = m.quoted.sender
    } else if (m.mentionedJid?.[0]) {
        target = m.mentionedJid[0]
    }
    
    if (!target) {
        return m.reply(
            `✊✌️✋ *sᴜɪᴛ ᴘᴠᴘ*\n\n` +
            `> Etiqueta a la persona que quieres desafiar!\n\n` +
            `*Ejemplo:*\n` +
            `> \`.suit @628xxx\``
        )
    }
    
    if (target === m.sender) {
        return m.reply('❌ No puedes desafiarte a ti mismo!')
    }
    
    const targetInGame = Object.values(global.suitGames).find(
        sala => [sala.p, sala.p2].includes(target)
    )
    
    if (targetInGame) {
        return m.reply('❌ Esa persona ya esta jugando piedra, papel o tijera con otra persona!')
    }
    
    const salaId = 'suit_' + Date.now()
    
    global.suitGames[salaId] = {
        id: salaId,
        chat: m.chat,
        p: m.sender,
        p2: target,
        status: 'waiting',
        pilih: null,
        pilih2: null,
        createdAt: Date.now(),
        timeout: setTimeout(() => {
            if (global.suitGames[salaId]) {
                sock.sendMessage(m.chat, {
                    text: `⏱️ *TIEMPO AGOTADO!*\n\n@${target.split('@')[0]} no respondio!\nJuego cancelado.`,
                    mentions: [target]
                })
                delete global.suitGames[salaId]
            }
        }, TIMEOUT)
    }
    
    await m.react('✊')
    await m.reply(`Desafiaste a @${target.split('@')[0]} a jugar piedra, papel o tijera\n\n` +
            `╭┈┈⬡「 💬 *ʀᴇsᴘᴏɴ* 」\n` +
            `┃ ✅ Escribe *terima* / *gas* / *ok* para aceptar\n` +
            `┃ ❌ Escribe *tolak* / *gabisa* para rechazar\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `Tiempo: 90 segundos`, {  mentions: [target]})
}

async function answerHandler(m, sock) {
    if (!m.body) return false
    
    const text = m.body.trim().toLowerCase()
    const db = getDatabase()
    
    let sala = null
    let salaId = null
    
    for (const [id, r] of Object.entries(global.suitGames)) {
        if (r.chat === m.chat && [r.p, r.p2].includes(m.sender)) {
            sala = r
            salaId = id
            break
        }
        if (!m.isGroup && [r.p, r.p2].includes(m.sender)) {
            sala = r
            salaId = id
            break
        }
    }
    
    if (!sala) return false
    
    if (sala.status === 'waiting' && m.sender === sala.p2 && m.chat === sala.chat) {
        if (/^(acc(ept)?|terima|gas|oke?|ok|iya|yoi)$/i.test(text)) {
            clearTimeout(sala.timeout)
            sala.status = 'playing'
            
            await m.react('🎮')
            
            await m.reply(`✊✌️✋ *sᴜɪᴛ ᴅɪᴍᴜʟᴀɪ!*\n\n` +
                    `@${sala.p.split('@')[0]} vs @${sala.p2.split('@')[0]}\n\n` +
                    `> 📩 Revisa el *chat privado* para elegir!\n` +
                `> ⏱️ Tiempo limite: 90 segundos`, {  mentions: [sala.p, sala.p2]})
            
            const pmMessage = `✊✌️✋ *sᴜɪᴛ - ᴘɪʟɪʜ ᴊᴀᴡᴀʙᴀɴ*\n\n` +
                `Escribe una opcion:\n\n` +
                `┃ ✊ *batu* (piedra)\n` +
                `┃ ✌️ *gunting* (tijera)\n` +
                `┃ ✋ *kertas* (papel)\n\n` +
                `*TIP: responde este mensaje con tu eleccion!*\n` +
                `Ejemplo: *batu*`
            
            try {
                await sock.sendMessage(sala.p, { text: pmMessage })
            } catch (e) {
                console.log('[Suit] Failed to PM player 1:', e.message)
            }
            
            try {
                await sock.sendMessage(sala.p2, { text: pmMessage })
            } catch (e) {
                console.log('[Suit] Failed to PM player 2:', e.message)
            }
            
            sala.timeout = setTimeout(async () => {
                if (global.suitGames[salaId]) {
                    if (!sala.pilih && !sala.pilih2) {
                        await sock.sendMessage(sala.chat, { 
                            text: '⏱️ Ningun jugador eligio, juego cancelado!' 
                        })
                    } else if (!sala.pilih || !sala.pilih2) {
                        const afk = !sala.pilih ? sala.p : sala.p2
                        const winner = !sala.pilih ? sala.p2 : sala.p
                        
                        db.updateKoin(winner, WIN_REWARD)
                        
                        await sock.sendMessage(sala.chat, {
                            text: `⏱️ *TIEMPO AGOTADO!*\n\n` +
                                `@${afk.split('@')[0]} no eligio!\n` +
                                `@${winner.split('@')[0]} gana! +Rp ${WIN_REWARD.toLocaleString()}`,
                            mentions: [afk, winner]
                        })
                    }
                    delete global.suitGames[salaId]
                }
            }, TIMEOUT)
            
            return true
        }
        
        if (/^(tolak|gamau|nanti|ga(k.)?bisa|no|tidak)$/i.test(text)) {
            clearTimeout(sala.timeout)
            
            await sock.sendMessage(sala.chat, {
                text: `❌ @${sala.p2.split('@')[0]} rechazo el desafio!\nJuego cancelado.`,
                mentions: [sala.p2]
            })
            
            delete global.suitGames[salaId]
            return true
        }
    }
    
    if (sala.status === 'playing' && !m.isGroup) {
        const choices = /^(batu|gunting|kertas)$/i
        
        if (!choices.test(text)) return false
        
        const choice = text.toLowerCase()
        
        if (m.sender === sala.p && !sala.pilih) {
            sala.pilih = choice
            await m.reply(`✅ Elegiste *${choice}* ${EMOJI[choice]}\n\n> Esperando al rival...`)
            
            if (!sala.pilih2) {
                await sock.sendMessage(sala.chat, {
                    text: `🕕 @${sala.p.split('@')[0]} ya eligio!\n> Esperando @${sala.p2.split('@')[0]}...`,
                    mentions: [sala.p, sala.p2]
                })
            }
        }
        
        if (m.sender === sala.p2 && !sala.pilih2) {
            sala.pilih2 = choice
            await m.reply(`✅ Elegiste *${choice}* ${EMOJI[choice]}\n\n> Esperando al rival...`)
            
            if (!sala.pilih) {
                await sock.sendMessage(sala.chat, {
                    text: `🕕 @${sala.p2.split('@')[0]} ya eligio!\n> Esperando @${sala.p.split('@')[0]}...`,
                    mentions: [sala.p, sala.p2]
                })
            }
        }
        
        if (sala.pilih && sala.pilih2) {
            clearTimeout(sala.timeout)
            
            let winner = null
            let tie = false
            
            if (sala.pilih === sala.pilih2) {
                tie = true
            } else if (
                (sala.pilih === 'batu' && sala.pilih2 === 'gunting') ||
                (sala.pilih === 'gunting' && sala.pilih2 === 'kertas') ||
                (sala.pilih === 'kertas' && sala.pilih2 === 'batu')
            ) {
                winner = sala.p
            } else {
                winner = sala.p2
            }
            
            let resultTxt = `✊✌️✋ *ʜᴀsɪʟ sᴜɪᴛ*\n\n`
            resultTxt += `@${sala.p.split('@')[0]} ${EMOJI[sala.pilih]} ${sala.pilih}\n`
            resultTxt += `@${sala.p2.split('@')[0]} ${EMOJI[sala.pilih2]} ${sala.pilih2}\n\n`
            
            if (tie) {
                resultTxt += `🤝 *EMPATE!*`
            } else {
                db.updateKoin(winner, WIN_REWARD)
                
                resultTxt += `🏆 @${winner.split('@')[0]} gana!\n`
                resultTxt += `> +Rp ${WIN_REWARD.toLocaleString()}`
            }
            
            await sock.sendMessage(sala.chat, {
                text: resultTxt,
                mentions: [sala.p, sala.p2]
            }, { quoted: m })
            
            delete global.suitGames[salaId]
        }
        
        return true
    }
    
    return false
}

export { pluginConfig as config, handler, answerHandler }
