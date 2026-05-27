import { queueFFmpeg } from '../../src/lib/ourin-ffmpeg.js'
import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const EFFECTS = {
    bass:      { emoji: '🔊', filter: 'bass=g=20:f=110:w=0.6', desc: 'Refuerzo de graves' },
    blown:     { emoji: '💥', filter: 'acrusher=level_in=4:level_out=5:bits=8:mode=log:aa=1', desc: 'Distorsi�n' },
    deep:      { emoji: '🎤', filter: 'asetrate=44100*0.7,atempo=1.3', desc: 'Voz grave' },
    earrape:   { emoji: '📢', filter: 'volume=10,bass=g=30:f=80:w=0.6,acrusher=level_in=8:level_out=12:bits=4:mode=log:aa=1', desc: 'Audio saturado' },
    echo:      { emoji: '🔁', filter: 'aecho=0.8:0.88:60:0.4', desc: 'Eco/gema' },
    fast:      { emoji: '⚡', filter: 'atempo=1.5', desc: 'Acelera 1.5x' },
    fat:       { emoji: '🎵', filter: 'bass=g=15:f=60:w=0.8,lowpass=f=3000,volume=1.5', desc: 'Graves densos' },
    nightcore: { emoji: '🌙', filter: 'asetrate=44100*1.25,atempo=0.9', desc: 'Nightcore' },
    reverse:   { emoji: '🔄', filter: 'areverse', desc: 'Reproducir al rev�s' },
    robot:     { emoji: '🤖', filter: "afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=512:overlap=0.75", desc: 'Voz de robot' },
    slow:      { emoji: '🐢', filter: 'atempo=0.8,asetrate=44100*0.9', desc: 'Ralentizado' },
    smooth:    { emoji: '🎶', filter: 'lowpass=f=4000,bass=g=3:f=100,treble=g=-2:f=3000,aecho=0.8:0.88:60:0.4', desc: 'Suave' },
    tupai:     { emoji: '🐿️', filter: 'asetrate=44100*1.5,atempo=0.8', desc: 'Voz aguda' },
    superfast: { emoji: '💨', filter: 'atempo=2.0', desc: 'Acelera 2x' },
    superslow: { emoji: '🦥', filter: 'atempo=0.5', desc: 'Ralentiza 2x' },
    tremolo:   { emoji: '〰️', filter: 'tremolo=f=8:d=0.7', desc: 'Tr�molo / vibraci�n' },
    vibrato:   { emoji: '🎸', filter: 'vibrato=f=7:d=0.5', desc: 'Vibrato' },
    phone:     { emoji: '📞', filter: 'highpass=f=300,lowpass=f=3400,volume=1.5', desc: 'Voz de tel�fono' },
    cave:      { emoji: '🕳️', filter: 'aecho=0.8:0.9:500:0.3,aecho=0.8:0.9:1000:0.2', desc: 'Eco de cueva' },
    radio:     { emoji: '📻', filter: 'highpass=f=300,lowpass=f=3000,acrusher=level_in=2:level_out=3:bits=12:mode=log:aa=1', desc: 'Voz de radio' },
    demon:     { emoji: '👹', filter: 'asetrate=44100*0.5,atempo=1.5,aecho=0.8:0.88:200:0.5', desc: 'Voz demon�aca' },
    underwater:{ emoji: '💧', filter: 'lowpass=f=500,tremolo=f=2:d=0.4', desc: 'Bajo el agua' },
    concert:   { emoji: '🏟️', filter: 'aecho=0.8:0.88:40:0.4,aecho=0.8:0.88:80:0.3,treble=g=3:f=4000', desc: 'Concierto en vivo' },
    '8bit':    { emoji: '👾', filter: 'acrusher=level_in=3:level_out=4:bits=4:mode=log:aa=0,aresample=8000', desc: 'Retro 8-bit' },
    helium:    { emoji: '🎈', filter: 'asetrate=44100*2.0,atempo=0.6', desc: 'Voz de helio' },
}

const EFFECT_NAMES = Object.keys(EFFECTS)

const allAliases = []
for (const name of EFFECT_NAMES) {
    allAliases.push(name)
}

const pluginConfig = {
    name: [...EFFECT_NAMES],
    alias: [],
    category: 'convert',
    description: 'Efectos de audio y cambiador de voz',
    usage: '.<efecto>',
    example: '',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 8,
    energi: 1,
    isEnabled: true
}

function getMediaSource(m) {
    const selfIsAudio = m.isAudio || m.message?.audioMessage
    const selfIsVideo = m.isVideo || m.message?.videoMessage
    const quotedIsAudio = m.quoted?.isAudio || m.quoted?.message?.audioMessage
    const quotedIsVideo = m.quoted?.isVideo || m.quoted?.message?.videoMessage

    if (selfIsAudio || selfIsVideo) {
        return { download: () => m.download(), ext: selfIsVideo ? 'mp4' : 'ogg' }
    }
    if (quotedIsAudio || quotedIsVideo) {
        return { download: () => m.quoted.download(), ext: quotedIsVideo ? 'mp4' : 'ogg' }
    }
    return null
}

function buildEffectList() {
    const categories = {
        '🎚️ *Graves y tono*': ['bass', 'fat', 'deep', 'smooth'],
        '⏩ *Velocidad*': ['fast', 'superfast', 'slow', 'superslow', 'nightcore'],
        '🎙️ *Voz*': ['tupai', 'helium', 'robot', 'demon', 'phone'],
        '🌊 *Espacio y eco*': ['echo', 'cave', 'concert', 'underwater', 'reverse'],
        '💀 *Distorsi�n*': ['blown', 'earrape', 'radio', '8bit'],
        '〰️ *Modulaci�n*': ['tremolo', 'vibrato'],
    }

    let txt = `🎧 *AUDIO FX* — ${EFFECT_NAMES.length} efectos\n\n`
    txt += `Responde a un audio/video y escribe el efecto\n\n`

    for (const [cat, effects] of Object.entries(categories)) {
        txt += `${cat}\n`
        for (const name of effects) {
            const fx = EFFECTS[name]
            txt += `  ${fx.emoji} *.${name}* — ${fx.desc}\n`
        }
        txt += `\n`
    }

    txt += `_Ejemplo: responde a un audio y escribe .bass_`
    return txt
}

async function handler(m, { sock }) {
    const command = m.command
    const effectName = command === 'audiofx' || command === 'fx' || command === 'audioeffect'
        ? m.args?.[0]?.toLowerCase()
        : command.toLowerCase()

    if (!effectName || effectName === 'list') {
        return m.reply(buildEffectList())
    }

    const fx = EFFECTS[effectName]
    if (!fx) {
        return m.reply(
            `❌ Efecto *${effectName}* no encontrado\n\n` +
            `Escribe *${m.prefix}audiofx list* para ver la lista de efectos`
        )
    }

    const media = getMediaSource(m)
    if (!media) {
        return m.reply(`${fx.emoji} *${effectName.toUpperCase()}*\n\nResponde a un audio/video con este comando`)
    }

    m.react('🕕')

    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

    const ts = Date.now()
    const inputPath = path.join(tempDir, `fx_in_${ts}.${media.ext}`)
    const outputPath = path.join(tempDir, `fx_out_${ts}.mp3`)

    try {
        const buffer = await media.download()
        if (!buffer?.length) {
            return m.reply(`❌ No se pudo descargar el archivo`)
        }

        fs.writeFileSync(inputPath, buffer)
        await queueFFmpeg(`ffmpeg -y -i "${inputPath}" -af "${fx.filter}" -vn "${outputPath}"`)

        if (!fs.existsSync(outputPath)) {
            return m.reply(`❌ No se pudo procesar el audio`)
        }

        const audioBuffer = fs.readFileSync(outputPath)

        await sock.sendMedia(m.chat, audioBuffer, null, m, {
            type: 'audio'
        })

        m.react('✅')
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    } finally {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
    }
}

export { pluginConfig as config, handler }