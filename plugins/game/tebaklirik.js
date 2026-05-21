import { games } from '../../src/lib/ourin-games.js'

games.register('tebaklirik', {
    alias: [],
    emoji: '🎤',
    title: 'ADIVINA LA LETRA',
    description: 'Adivina la letra de la cancion'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebaklirik')
export { pluginConfig as config, handler, answerHandler }
