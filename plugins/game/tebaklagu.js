import { games } from '../../src/lib/ourin-games.js'

games.register('tebaklagu', {
    alias: ['tl', 'guesssong'],
    emoji: '🎵',
    title: 'ADIVINA LA CANCION',
    description: 'Adivina el titulo de la cancion'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebaklagu')
export { pluginConfig as config, handler, answerHandler }
