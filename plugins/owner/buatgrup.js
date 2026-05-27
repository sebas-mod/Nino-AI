const pluginConfig = {
    name: ['buatgrupos', 'creategroup', 'newgroup'],
    alias: [],
    category: 'owner',
    description: 'Crear grupo nuevo',
    usage: '.buatgrupos <nombre>|<numero1,numero2,...>|<duracion_minutos>',
    example: '.buatgrupos Grupo nuevo|628xxx,628yyy|60',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text?.trim() || ''
    const args = text.split('|')

    if (args.length < 2) {
        let txt = `👥 *CREAR GRUPO NUEVO* 👥\n\n`
        txt += `Hola owner! Quieres crear un grupo nuevo al instante?\n\n`
        txt += `*Modo de uso:*\n`
        txt += `👉 \`${m.prefix}buatgrupos Nombre del grupo | 628xxx,628yyy | Duracion(minutos)\`\n\n`
        txt += `*Detail:*\n`
        txt += `• Usa \`|\` para separar nombre, participantes y duracion\n`
        txt += `• Separa los numeros de participantes con coma\n`
        txt += `• Si completas la duracion, el bot expulsara a todos los miembros y eliminara el grupo cuando se acabe el tiempo!\n`
        txt += `• Bot otomatis menjadi admin\n\n`
        txt += `*Ejemplo sin duracion:*\n`
        txt += `\`${m.prefix}buatgrupos Tim Alpha | 628123,628456\`\n\n`
        txt += `*Ejemplo con duracion (activo 60 minutos):*\n`
        txt += `\`${m.prefix}buatgrupos Tim Beta | 628123,628456 | 60\``
        return m.reply(txt)
    }

    const name = args[0].trim()
    const participantsStr = args[1].trim()
    const durationStr = args[2] ? args[2].trim() : ''

    if (!name || name.length < 2) {
        return m.reply('❌ El nombre del grupo es demasiado corto! Minimo 2 caracteres.')
    }

    const participants = participantsStr
        .split(/[,;\s]+/)
        .map(n => n.replace(/[^0-9]/g, ''))
        .filter(n => n.length >= 5)
        .map(n => n + '@s.whatsapp.net')

    if (participants.length === 0) {
        return m.reply('❌ Donde esta el numero del participante? Ingresa al menos 1 numero.')
    }

    let durationMs = 0
    let durationMins = 0
    if (durationStr) {
        durationMins = parseInt(durationStr.replace(/[^0-9]/g, ''))
        if (!isNaN(durationMins) && durationMins > 0) {
            durationMs = durationMins * 60 * 1000
        }
    }

    try {
        await m.react('🕕')
        const group = await sock.groupCreate(name, participants)
        
        let successTxt = `👥 *GRUPO CREADO CORRECTAMENTE* 👥\n\n`
        successTxt += `✨ *Nombre:* ${name}\n`
        successTxt += `🆔 *ID:* ${group.id}\n`
        successTxt += `👤 *Pey tambien:* ${participants.length} orang\n`
        
        if (durationMs > 0) {
            successTxt += `⏳ *Masa Activo:* ${durationMins} Menit\n`
            successTxt += `\n⚠️ _Este grupo se eliminara automaticamente y todos los miembros seran expulsados cuando termine el tiempo activo!_\n`
        }

        successTxt += `\n_El bot se vuelve admin de este grupo automaticamente!_`
        await m.reply(successTxt)

        if (durationMs > 0) {
            setTimeout(async () => {
                try {
                    const groupMeta = await sock.groupMetadata(group.id)
                    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'
                    
                    const membersToKick = groupMeta.participants
                        .map(p => p.id)
                        .filter(id => id !== botJid)

                    if (membersToKick.length > 0) {
                        await sock.sendMessage(group.id, { text: `⏳ *TIEMPO ACTIVO DEL GRUPO AGOTADO* ⏳\n\nSegun la orden del owner, el tiempo de este grupo termino. Adios a todos! 👋` })
                        await sock.groupParticipantsUpdate(group.id, membersToKick, 'remove')
                    }
                    
                    await sock.groupLeave(group.id)
                } catch (e) {
                    console.log(`Fallo: eliminar grupo automaticamente (${group.id}):`, e)
                }
            }, durationMs)
        }

        await m.react('✅')
    } catch (err) {
        await m.react('❌')
        return m.reply(`❌ Lo siento, no se pudo crear el grupo! 😭\nError: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
