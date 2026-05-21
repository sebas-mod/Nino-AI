import config from '../../config.js'
const pluginConfig = {
    name: 'benefitpartner',
    alias: ['partnerbenefits', 'keuntunganpartner'],
    category: 'info',
    description: 'Ver beneficios de ser partner del bot',
    usage: '.benefitpartner',
    example: '.benefitpartner',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {

    const prefix = m.prefix || '.'

    let txt = `🤝 *BENEFICIOS DE PARTNER*\n\n`
    txt += `Beneficios de ser partner de ${config.bot?.name || 'Bot'}:\n\n`

    txt += `🔓 *Acceso a Funciones*\n`
    txt += `├ Todas las funciones premium desbloqueadas\n`
    txt += `├ Energia y monedas ilimitadas\n`
    txt += `├ Acceso a ciertos comandos de owner\n`
    txt += `└ Soporte prioritario\n\n`

    txt += `📦 *Panel Pterodactyl*\n`
    txt += `├ Puedes crear tu propio servidor\n`
    txt += `├ Acceso al panel de gestion\n`
    txt += `└ Puedes vender paneles (reseller)\n\n`

    txt += `💎 *Bonus*\n`
    txt += `├ +200.000 EXP al activar\n`
    txt += `├ +20.000 monedas al activar\n`
    txt += `├ Insignia de partner en el perfil\n`
    txt += `└ Acceso anticipado a funciones\n\n`

    txt += `💰 *Como Ser Partner*\n`
    txt += `├ Contacta al owner: ${config.owner?.name || 'Owner'}\n`
    txt += `├ Duracion: 30/60/90 dias\n`
    txt += `└ Comando: \`${prefix}addpartner\` (solo owner)\n\n`

    txt += `📋 *Comandos de Partner*\n`
    txt += `├ \`${prefix}cekpartner\` — Ver estado de partner\n`
    txt += `├ \`${prefix}cekprem\` — Ver estado premium\n`
    txt += `├ \`${prefix}cekowner\` — Ver rol del usuario\n`
    txt += `└ \`${prefix}listpartner\` — Lista de partners\n\n`

    txt += `> _Contacta al owner para mas informacion_`

    await m.reply(txt)
}

export { pluginConfig as config, handler }
