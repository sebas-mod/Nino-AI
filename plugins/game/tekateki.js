import { games } from '../../src/lib/ourin-games.js'

games.register('tekateki', {
    alias: ['teka'],
    emoji: '🧩',
    title: 'ACERTIJO',
    description: 'Juego tradicional de acertijos'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tekateki')
export { pluginConfig as config, handler, answerHandler }
