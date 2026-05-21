import { games } from '../../src/lib/ourin-games.js'

games.register('caklontong', {
    alias: ['cak', 'lontong'],
    emoji: '🤔',
    title: 'CAK LONTONG',
    description: 'Juego Cak Lontong - respuestas inesperadas'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('caklontong')
export { pluginConfig as config, handler, answerHandler }
