import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'rules',
    alias: ['aturanbot', 'botrules'],
    category: 'main',
    description: 'Muestra las reglas del bot',
    usage: '.rules',
    example: '.rules',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const DEFAULT_BOT_RULES = [
    'No hagas spam de comandos',
    'Usa las funciones con criterio',
    'Prohibido abusar del bot',
    'Respeta a los demas usuarios',
    'Reporta errores al owner',
    'No pidas funciones extranas',
    'El bot no esta activo 24/7, puede haber mantenimiento'
]

async function handler(m, { sock, config: botConfig }) {
    try {
        const db = getDatabase()
        const customRules = db.setting('botRules')

        let rulesList = DEFAULT_BOT_RULES

        if (customRules) {
            rulesList = customRules
                .split('\n')
                .map(v => v.replace(/^[^a-zA-Z0-9]+/, '').trim())
                .filter(Boolean)
        }

        const tableData = rulesList.map((rule, i) => [
            `${i + 1}`,
            rule
        ])

        await sock.sendTable(
            m.chat,
            '📜 Aturan Bot',
            ['No', 'Regla'],
            tableData,
            m,
            {
                headerText: `${botConfig.bot?.name || 'Nino AI'} *REGLAS*`,
                footer: 'Incumplir las reglas puede causar ban / expulsion!'
            }
        )
    } catch (e) {
        m.reply('Ocurrio un error al obtener las reglas')
    }
}

export { pluginConfig as config, handler }
