import { games } from '../../src/lib/ourin-games.js'

games.register('tebakfilm', {
    alias: ['tf', 'guessmovie'],
    emoji: '🎬',
    title: 'ADIVINA LA PELICULA',
    description: 'Adivina el titulo de la pelicula'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakfilm')
export { pluginConfig as config, handler, answerHandler }
