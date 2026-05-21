import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { exec } from 'child_process'
import { promisify } from 'util'
import { downloadMediaMessage } from 'ourin'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const run = promisify(exec)

const pluginConfig = {
    name: "upch",
    alias: ["uploadch", "uploadsaluran", "uch"],
    category: "owner",
    description: "Subir imagen, audio, video o texto al canal",
    usage: ".upch <id canal> <texto opcional>",
    example: ".upch 12xxx@newsletter Hola!",
    cooldown: 10,
    energi: 0,
    isOwner: true,
    isEnabled: true
}

async function toOggOpus(inputBuf) {
    const tmp = path.join(process.cwd(), "temp")
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true })
    const id = crypto.randomBytes(6).toString("hex")
    const inp = path.join(tmp, `upch_in_${id}`)
    const out = path.join(tmp, `upch_out_${id}.ogg`)
    fs.writeFileSync(inp, inputBuf)
    await run(`ffmpeg -y -i "${inp}" -vn -map_metadata -1 -ac 1 -ar 48000 -c:a libopus -b:a 96k -vbr on -application audio -f ogg "${out}"`)
    const buf = fs.readFileSync(out)
    try { fs.unlinkSync(inp) } catch {}
    try { fs.unlinkSync(out) } catch {}
    return buf
}

async function handler(m, { sock }) {
    const args = m.text?.replace(/^\.upch\s+/i, '').split(" ") || []
    const chId = args[0]?.includes("@newsletter") ? args.shift() : config?.saluran?.id
    const chName = config?.saluran?.name || config?.bot?.name || "Ourin-AI"
    const caption = args.join(" ").trim()

    const quoted = m.quoted || m
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    const isVideo = m.isVideo || (m.quoted && m.quoted.type === 'videoMessage')
    const isAudio = m.type === 'audioMessage' || (m.quoted && m.quoted.type === 'audioMessage')
    const isMedia = isImage || isVideo || isAudio

    if (!isMedia && !caption) {
        return m.reply(
            `📤 *SUBIR AL CANAL*\n\n` +
            `Envia/responde un medio con caption:\n` +
            `  \`${m.prefix}upch 12xxx@newsletter <texto opcional>\`\n\n` +
            `*Support:*\n` +
            `  🖼️ Imagen\n` +
            `  🎥 Video\n` +
            `  🎵 Audio/VN\n` +
            `  📝 Texto (sin medio)`
        )
    }

    await m.react("🕕")

    try {
        if (!isMedia && caption) {
            await sock.sendMessage(chId, { text: caption })
            await m.react("✅")
            return m.reply(`✅ Texto enviado correctamente al canal`)
        }

        const mediaBuf = await downloadMediaMessage(quoted, "buffer", {})
        if (!mediaBuf || mediaBuf.length < 1000) throw new Error("El medio es demasiado pequeno o fallo la descarga")

        if (isImage) {
            await sock.sendMessage(chId, {
                image: mediaBuf,
                caption: caption || undefined
            })
            await m.react("✅")
            return m.reply("✅ Imagen enviada correctamente al canal")
        }

        if (isVideo) {
            await sock.sendMessage(chId, {
                video: mediaBuf,
                caption: caption || undefined
            })
            await m.react("✅")
            return m.reply("✅ Video enviado correctamente al canal")
        }

        if (isAudio) {
            const opusBuf = await toOggOpus(mediaBuf)
            if (opusBuf.length < 5000) throw new Error("Fallo la conversion a opus")
            await sock.sendMessage(chId, {
                audio: opusBuf,
                mimetype: "audio/ogg; codecs=opus",
                ptt: true
            })
            await m.react("✅")
            return m.reply("✅ Audio enviado correctamente al canal")
        }

        m.reply("❌ Tipo de medio no compatible")
    } catch (e) {
        console.error("[UpCh]", e)
        await m.react("☢")
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
