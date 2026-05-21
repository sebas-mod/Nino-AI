import config from '../../config.js'
const pluginConfig = {
    name: 'templateplugin',
    alias: ['tplplugin', 'plugin-template'],
    category: 'owner',
    description: 'Generar plantilla de plugin (solo owner)',
    usage: '.templateplugin',
    example: '.templateplugin',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}
function handler(m, { sock }) {
    if (!config.isOwner(m.sender)) {
        return m.reply('❌ *Solo owner!*')
    }
    const template = `
const pluginConfig = {
    name: 'example',
    alias: ['ex'],
    category: 'general',
    description: 'Plugin de ejemplo',
    usage: '.example',
    example: '.example',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 1,
    isEnabled: true
}
async function handler(m, { sock }) {
    try {
        await m.reply('Este es un plugin de ejemplo!')
    } catch (error) {
        console.error('Example Plugin Error:', error)
        await m.reply('❌ *FALLO*\\n\\n> ' + error.message)
    }
}
export { pluginConfig as config, handler }
`
    m.reply(`\`\`\`${template}\`\`\``)
}
export { pluginConfig as config, handler }