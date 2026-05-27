const pluginConfig = {
    name: 'stop',
    alias: ['shutdown', 'kill'],
    category: 'owner',
    description: 'Detener proceso del bot',
    usage: '.stop',
    example: '.stop',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    await m.reply('🛑 *Deteniendo bot...*\n\n> Bot apagado. Debe iniciarse manualmente desde la terminal.')
    console.log('Stopping via command...')
    
    // Allow message to send before exit
    setTimeout(() => {
        process.exit(1) // Exit code 1 usually stops auto-restart in simple loops
    }, 1000)
}

export { pluginConfig as config, handler }