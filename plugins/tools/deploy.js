import axios from 'axios'
import config from '../../config.js'
const pluginConfig = {
    name: 'deploy',
    alias: ['vercel'],
    category: 'owner',
    description: 'Despliega HTML en Vercel (responde a código / archivo)',
    usage: '.deploy <nombreweb>',
    example: '.deploy mysite',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const name = m.args[0]
    if (!name) {
        return m.reply(
`🚀 *DEPLOY*

> Ingresa el nombre del sitio web
> Responde con código HTML o un archivo .html

Ejemplo:
.deploy mysite`
        )
    }

    if (!m.quoted) {
        return m.reply(
`❌ *HTML NO ENCONTRADO*

> Responde a un mensaje que contenga HTML
> o responde a un archivo .html`
        )
    }

    const token = config.vercel?.token
    if (!token) {
        return m.reply('❌ *El token de Vercel no está configurado*')
    }

    m.react('🚀')

    let htmlContent

    try {
        if (m.quoted.text || m.quoted.body) {
            htmlContent = m.quoted.text || m.quoted.body
        } else if (
            m.quoted.mimetype === 'text/html' ||
            (m.quoted.filename && m.quoted.filename.endsWith('.html'))
        ) {
            const buffer = await m.quoted.download()
            htmlContent = buffer.toString()
        } else {
            m.react('❌')
            return m.reply(
`❌ *FORMATO NO SOPORTADO*

> Responde con texto HTML
> o archivo .html`
            )
        }

        if (!/<html|<!doctype html|<head|<body/i.test(htmlContent)) {
            m.react('❌')
            return m.reply(
`❌ *NO ES HTML VÁLIDO*

> Asegúrate de que contenga estructura HTML`
            )
        }

        const payload = {
            name,
            project: name,
            target: 'production',
            files: [
                {
                    file: 'index.html',
                    data: htmlContent
                }
            ],
            projectSettings: {
                framework: null
            }
        }

        await axios.post(
            'https://api.vercel.com/v13/deployments',
            payload,
            {
                headers: {
                    Autorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        )

        let domain = `${name}.vercel.app`

        try {
            const domainsRes = await axios.get(
                `https://api.vercel.com/v9/projects/${name}/domains`,
                {
                    headers: {
                        Autorization: `Bearer ${token}`
                    },
                    timeout: 30000
                }
            )

            const domains = domainsRes.data.domains || []

            domain =
                domains.find(d => !d.name.endsWith('.vercel.app'))?.name ||
                domains.find(d => d.name.endsWith('.vercel.app'))?.name ||
                domain
        } catch {
            // fallback tetap ke default domain
        }

        m.react('✅')

        await m.reply(
`╭──「 *DEPLOY EXITOSO* 」
│
│ 🌐 Nombre   : ${name}
│ ☁️ Platform : Vercel
│ 📄 Tipo     : Static HTML
│ ⚙️ Status   : Construyendo
│
│ 🔗 URL
│ https://${domain}
│
╰────────────────`
        )

    } catch (error) {
        m.react('❌')

        const err =
            error.response?.data?.error?.message ||
            error.response?.data?.message ||
            error.message

        m.reply(
`╭──「 *DEPLOY FALLIDO* 」
│
│ ❌ ${err}
│
╰────────────────`
        )
    }
}

export { pluginConfig as config, handler }