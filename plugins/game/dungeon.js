import { getDatabase } from "../../src/lib/ourin-database.js"
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js"
import te from "../../src/lib/ourin-error.js"

const pluginConfig = {
    name: 'dungeon',
    alias: ['dg', 'explore', 'labirin'],
    category: 'game',
    description: 'Explora mazmorras y lucha contra monstruos de forma interactiva',
    usage: '.dungeon',
    example: '.dungeon',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

const DUNGEONS = [
    { id: 1, name: '🌲 Bosque Oscuro', levelReq: 1, monsters: ['Goblin Salvaje', 'Slime Gigante', 'Lobo Nocturno', 'Bandido del Bosque'], minReward: 100, maxReward: 300, dropChance: 40 },
    { id: 2, name: '🍄 Pantano Venenoso', levelReq: 5, monsters: ['Sapo Mutante', 'Arbol Andante', 'Arana Venenosa', 'Vibora del Pantano'], minReward: 250, maxReward: 500, dropChance: 45 },
    { id: 3, name: '🏰 Castillo Antiguo', levelReq: 10, monsters: ['Soldado Esqueleto', 'Zombie Hambriento', 'Fantasma Inquieto', 'Gargola de Piedra'], minReward: 400, maxReward: 800, dropChance: 50 },
    { id: 4, name: '🏜️ Desierto de la Muerte', levelReq: 15, monsters: ['Escorpion Gigante', 'Momia Despierta', 'Gusano del Desierto', 'Genio Malvado'], minReward: 600, maxReward: 1200, dropChance: 55 },
    { id: 5, name: '🌋 Volcan', levelReq: 20, monsters: ['Elemental de Fuego', 'Golem de Magma', 'Dragon Pequeno', 'Sabueso Infernal'], minReward: 900, maxReward: 1700, dropChance: 60 },
    { id: 6, name: '🧊 Cueva de Hielo Eterno', levelReq: 25, monsters: ['Golem de Hielo', 'Gigante de Escarcha', 'Yeti Feroz', 'Lobo de Nieve'], minReward: 1300, maxReward: 2400, dropChance: 65 },
    { id: 7, name: '☁️ Ruinas del Cielo', levelReq: 30, monsters: ['Arpia del Rayo', 'Grifo Salvaje', 'Valquiria Caida', 'Golem de Viento'], minReward: 1800, maxReward: 3300, dropChance: 70 },
    { id: 8, name: '🌊 Mar de Sombras', levelReq: 35, monsters: ['Kraken Joven', 'Sirena Encantadora', 'Tiburon Fantasma', 'Leviatan Rojo'], minReward: 2500, maxReward: 4500, dropChance: 75 },
    { id: 9, name: '🕳️ Abismo de la Nada', levelReq: 40, monsters: ['Angel de la Muerte', 'Caminante del Vacio', 'Demonio de Sombras', 'Bestia Colosal'], minReward: 3500, maxReward: 6000, dropChance: 80 },
    { id: 10, name: '👹 Infierno Profundo', levelReq: 50, monsters: ['Demonio Rojo', 'Sucubo Mortal', 'Cerbero', 'Rey Demonio'], minReward: 5000, maxReward: 10000, dropChance: 90 }
]

const LOOT_TABLE = [
    { item: 'iron', chance: 40, qty: [1, 5], icon: '⛏️' },
    { item: 'gold', chance: 20, qty: [1, 3], icon: '🪙' },
    { item: 'diamond', chance: 5, qty: [1, 2], icon: '💎' },
    { item: 'potion', chance: 30, qty: [1, 3], icon: '🧪' },
    { item: 'herb', chance: 25, qty: [2, 6], icon: '🌿' },
    { item: 'leather', chance: 35, qty: [2, 5], icon: '👞' },
    { item: 'mysterybox', chance: 3, qty: [1, 1], icon: '📦' }
]

async function handler(m, { sock }) {
    try {
        const db = getDatabase()
        const user = db.getUser(m.sender)

        if (!user.rpg) user.rpg = {}
        if (!user.inventory) user.inventory = {}
        
        const session = user.rpg.dungeon_session || null
        const userLevel = user.level || 1

        if (session) {
            return m.reply(
                `⚔️ *SESION DE MAZMORRA AUN ACTIVA*\n\n` +
                `Estas en medio de una exploracion!\n` +
                `> Responde al ultimo mensaje del bot para cancelar (escribe \`batal\`) o continuar la accion (escribe \`serang\` / \`lari\`).`
            )
        }

        const available = DUNGEONS.filter(d => userLevel >= d.levelReq)
        if (available.length === 0) {
            return m.reply(`❌ *NIVEL DEMASIADO BAJO*\n\n> Tu nivel actual es *${userLevel}*. Necesitas al menos nivel *1* para entrar a la mazmorra mas facil.`)
        }

        user.rpg.dungeon_session = {
            stage: 'lobi',
            time: Date.now()
        }
        db.save()

        let txt = `🏰 *LOBBY DE MAZMORRA*\n\n`
        txt += `📊 *Tus estadisticas:*\n`
        txt += `> Nivel: *${userLevel}*\n`
        txt += `> Stamina: *${user.rpg.stamina ?? 100}/100*\n\n`
        txt += `Elige el lugar que quieres explorar:\n\n`
        
        for (const d of DUNGEONS) {
            if (userLevel >= d.levelReq) {
                txt += `🔓 *${d.id}.* ${d.name} (Lv ${d.levelReq}+)\n`
            } else {
                txt += `> 🔒 *${d.id}.* ${d.name} (Requiere Lv ${d.levelReq})\n`
            }
        }
        txt += `\n> 💡 Responde este mensaje con el *numero* del lugar desbloqueado (ejemplo: \`1\`) o escribe \`batal\` para salir.`
        
        return m.reply(txt)
    } catch (error) {
        console.error(error)
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

async function dungeonAnswerHandler(m, sock) {
    if (!m.body || m.isCommand) return false

    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user || !user.rpg || !user.rpg.dungeon_session) return false

    const session = user.rpg.dungeon_session
    const text = m.body.trim().toLowerCase()
    const userLevel = user.level || 1

    if (text === 'batal' || text === 'cancel' || text === 'keluar') {
        delete user.rpg.dungeon_session
        db.save()
        await m.reply(`🚪 Saliste del lobby de la mazmorra sano y salvo.`)
        return true
    }

    if (session.stage === 'lobi') {
        const choiceId = parseInt(text)
        if (isNaN(choiceId)) return false 

        const dungeon = DUNGEONS.find(d => d.id === choiceId)

        if (!dungeon) {
            await m.reply(`❌ *OPCION NO VALIDA*\n\n> Mazmorra numero ${choiceId} no encontrado.`)
            return true
        }

        if (userLevel < dungeon.levelReq) {
            await m.reply(`🔒 *MAZMORRA BLOQUEADA*\n\n> Tu nivel (*Lv ${userLevel}*) no es suficiente para entrar a *${dungeon.name}*.\n> Necesitas al menos *Lv ${dungeon.levelReq}*.`)
            return true
        }

        const staminaCost = 30
        user.rpg.stamina = user.rpg.stamina ?? 100

        if (user.rpg.stamina < staminaCost) {
            await m.reply(
                `⚡ *STAMINA INSUFICIENTE*\n\n` +
                `Necesitas al menos *${staminaCost} stamina* para entrar.\n` +
                `Tu stamina restante es solo *${user.rpg.stamina}*.\n\n` +
                `> 💡 *Consejo:* Usa el comando \`.rest\` o cancela primero (escribe \`batal\`).`
            )
            return true
        }

        user.rpg.stamina -= staminaCost
        const monster = dungeon.monsters[Math.floor(Math.random() * dungeon.monsters.length)]
        const monsterPower = (dungeon.levelReq * 10) + Math.floor(Math.random() * 30)

        user.rpg.dungeon_session = {
            stage: 'encounter',
            dungeonId: dungeon.id,
            dungeonName: dungeon.name,
            levelReq: dungeon.levelReq,
            monster: monster,
            monsterPower: monsterPower,
            maxReward: dungeon.maxReward,
            minReward: dungeon.minReward,
            dropChance: dungeon.dropChance,
            time: Date.now()
        }
        
        db.save()

        await m.react('🚪')
        let txt = `🚪 *ENTRANDO A LA MAZMORRA*\n\n`
        txt += `Avanzas lentamente dentro de *${dungeon.name}*...\n`
        txt += `> ⚡ Stamina reducida *${staminaCost}*\n\n`
        txt += `De repente, *👹 ${monster}* aparece desde la oscuridad y bloquea tu camino!\n\n`
        txt += `*⚔️ QUE QUIERES HACER?*\n`
        txt += `> Responde este mensaje con \`serang\` para luchar\n`
        txt += `> Responde este mensaje con \`lari\` para huir (arriesgado)`

        await m.reply(txt)
        return true
    }

    if (session.stage === 'encounter') {
        if (text === 'serang' || text === 'attack' || text === 'lawan') {
            const userPower = (user.rpg.attack || 10) + (userLevel * 4) + Math.floor(Math.random() * 20)
            const isWin = userPower >= session.monsterPower || Math.random() > 0.4
            
            let reportText = ''

            if (isWin) {
                const expReward = (150 * (session.levelReq / 2)) + Math.floor(Math.random() * 200)
                const goldReward = Math.floor(Math.random() * (session.maxReward - session.minReward)) + session.minReward
        
                const droppedItems = []
                for (const loot of LOOT_TABLE) {
                    if ((Math.random() * 100) < (loot.chance * (session.dropChance / 50))) {
                        const qty = Math.floor(Math.random() * (loot.qty[1] - loot.qty[0] + 1)) + loot.qty[0]
                        user.inventory[loot.item] = (user.inventory[loot.item] || 0) + qty
                        droppedItems.push(`${loot.icon} ${loot.item} (x${qty})`)
                    }
                }
        
                user.koin = (user.koin || 0) + goldReward
                await addExpWithLevelCheck(sock, m, db, user, expReward)
        
                reportText += `🎉 *VICTORIA BRILLANTE!*\n\n`
                reportText += `Con un ataque letal, lograste derrotar a *${session.monster}*!\n\n`
                reportText += `*🎁 RECOMPENSAS OBTENIDAS:*\n`
                reportText += `> ✨ EXP: *+${Math.floor(expReward)}*\n`
                reportText += `> 💰 Koin: *+${goldReward.toLocaleString()}*\n`
                
                if (droppedItems.length > 0) {
                    reportText += `\n*📦 BOTIN:*\n`
                    reportText += `> ${droppedItems.join('\n> ')}\n`
                }
        
                await m.react('🏆')
            } else {
                const goldLoss = Math.floor((user.koin || 0) * 0.15)
                user.koin = Math.max(0, (user.koin || 0) - goldLoss)
                user.rpg.health = Math.max(1, (user.rpg.health || 100) - 40)
        
                reportText += `💀 *DERROTA TRAGICA!*\n\n`
                reportText += `Tu fuerza aun no fue suficiente! *${session.monster}* te hizo retroceder con fuerza.\n`
                reportText += `Lograste salir arrastrandote con el cuerpo herido.\n\n`
                reportText += `*💔 PERDIDAS:*\n`
                reportText += `> 💸 Dinero perdido: *-${goldLoss.toLocaleString()} Koin*\n`
                reportText += `> ❤️ Vida reducida: *-40 HP*\n\n`
                reportText += `> 💡 *Consejo:* Sube de nivel, usa pociones o mejora tus armas!`
        
                await m.react('💀')
            }
            
            delete user.rpg.dungeon_session
            db.save()
            await m.reply(reportText)
            return true
            
        } else if (text === 'lari' || text === 'kabur' || text === 'run') {
            const escapeChance = Math.random() > 0.5
            let reportText = ''
            
            if (escapeChance) {
                reportText += `🏃‍♂️ *ESCAPE EXITOSO!*\n\n`
                reportText += `Te das vuelta y corres con todas tus fuerzas. *${session.monster}* pierde tu rastro!\n`
                reportText += `Saliste sin heridas, pero esta aventura fue en vano.`
                await m.react('💨')
            } else {
                const hpLoss = 25
                user.rpg.health = Math.max(1, (user.rpg.health || 100) - hpLoss)
                reportText += `💥 *NO PUDISTE HUIR!*\n\n`
                reportText += `Tropezaste con unas rocas! *${session.monster}* te alcanza y clava sus garras en tu cuerpo!\n\n`
                reportText += `*💔 PERDIDAS:*\n`
                reportText += `> ❤️ Vida reducida: *-${hpLoss} HP*`
                await m.react('🩸')
            }
            
            delete user.rpg.dungeon_session
            db.save()
            await m.reply(reportText)
            return true
            
        } else {
            await m.reply(
                `❓ *OPCION DESCONOCIDA*\n\n` +
                `> Responde con \`serang\` para luchar contra el monstruo.\n` +
                `> Responde con \`lari\` para huir.\n` +
                `> Responde con \`batal\` si de verdad te rindes.`
            )
            return true
        }
    }
    
    return false
}

export { pluginConfig as config, handler, dungeonAnswerHandler }
